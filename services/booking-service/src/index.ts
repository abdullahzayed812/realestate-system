import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { DatabaseConnection, RedisConnection } from '@realestate/database';
import { errorHandler, requestLogger, authenticate, authorize, validate } from '@realestate/middlewares';
import { ApiResponse } from '@realestate/response';
import { BookingService } from './services/BookingService';
import { createLogger } from '@realestate/utils';
import Joi from 'joi';

dotenv.config();

const logger = createLogger('BookingService');
const PORT = parseInt(process.env.PORT || '3003', 10);

const createBookingSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  type: Joi.string().valid('VISIT', 'RENT', 'PURCHASE').required(),
  scheduledAt: Joi.string().isoDate().required(),
  duration: Joi.number().integer().min(15).optional(),
  checkIn: Joi.string().isoDate().optional(),
  checkOut: Joi.string().isoDate().optional(),
  notes: Joi.string().max(500).optional().allow('', null),
  brokerId: Joi.string().uuid().required(),
});

const cancelSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
});

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
  app.use(express.json());
  app.use(requestLogger);

  const redis = RedisConnection.getInstance();
  await redis.connect();

  const bookingService = new BookingService();

  // Create booking (customer)
  app.post(
    '/api/bookings',
    authenticate,
    authorize('CUSTOMER'),
    validate(createBookingSchema),
    async (req, res) => {
      const { brokerId, ...dto } = req.body;
      const booking = await bookingService.createBooking(req.user!.sub, dto, brokerId);
      ApiResponse.created(res, booking, 'Booking created successfully');
    },
  );

  // Get my bookings
  app.get('/api/bookings', authenticate, async (req, res) => {
    const role = req.user!.role;
    const status = req.query.status as string | undefined;
    const bookings = role === 'BROKER' || role === 'COMPANY'
      ? await bookingService.getBrokerBookings(req.user!.sub, status as any)
      : await bookingService.getCustomerBookings(req.user!.sub, status as any);
    ApiResponse.success(res, bookings);
  });

  // Get single booking
  app.get('/api/bookings/:id', authenticate, async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user!.sub);
    ApiResponse.success(res, booking);
  });

  // Confirm (broker)
  app.patch(
    '/api/bookings/:id/confirm',
    authenticate,
    authorize('BROKER', 'COMPANY'),
    async (req, res) => {
      const booking = await bookingService.confirmBooking(req.params.id, req.user!.sub);
      ApiResponse.success(res, booking, 'Booking confirmed');
    },
  );

  // Cancel
  app.patch(
    '/api/bookings/:id/cancel',
    authenticate,
    validate(cancelSchema),
    async (req, res) => {
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user!.sub,
        req.body.reason,
      );
      ApiResponse.success(res, booking, 'Booking cancelled');
    },
  );

  // Complete (broker)
  app.patch(
    '/api/bookings/:id/complete',
    authenticate,
    authorize('BROKER', 'COMPANY'),
    async (req, res) => {
      const booking = await bookingService.completeBooking(req.params.id, req.user!.sub);
      ApiResponse.success(res, booking, 'Booking completed');
    },
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'booking-service' });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`Booking Service running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Booking Service:', err);
  process.exit(1);
});
