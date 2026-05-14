import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { RedisConnection } from '@realestate/database';
import { errorHandler, requestLogger, authenticate } from '@realestate/middlewares';
import { ApiResponse } from '@realestate/response';
import { FirebaseNotificationService } from './services/FirebaseNotificationService';
import { createLogger } from '@realestate/utils';

dotenv.config();

const logger = createLogger('NotificationService');
const PORT = parseInt(process.env.PORT || '3005', 10);

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
  app.use(express.json());
  app.use(requestLogger);

  const redis = RedisConnection.getInstance();
  await redis.connect();

  const notifService = new FirebaseNotificationService();

  // Get my notifications
  app.get('/api/notifications', authenticate, async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await notifService.getUserNotifications(req.user!.sub, page, limit);
    ApiResponse.success(res, result);
  });

  // Mark all as read
  app.patch('/api/notifications/read-all', authenticate, async (req, res) => {
    await notifService.markAllRead(req.user!.sub);
    ApiResponse.success(res, null, 'All notifications marked as read');
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'notification-service' });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`Notification Service running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Notification Service:', err);
  process.exit(1);
});
