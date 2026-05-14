import { IBooking, ICreateBookingDto, BookingStatus } from '@realestate/types';
import { NotFoundError, ForbiddenError, ValidationError } from '@realestate/errors';
import { createLogger } from '@realestate/utils';
import { BookingRepository } from '../repositories/BookingRepository';

const logger = createLogger('BookingService');

export class BookingService {
  private bookingRepo: BookingRepository;

  constructor() {
    this.bookingRepo = new BookingRepository();
  }

  async createBooking(
    customerId: string,
    dto: ICreateBookingDto,
    brokerId: string,
  ): Promise<IBooking> {
    // Validate scheduled date is in the future
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt <= new Date()) {
      throw new ValidationError('Booking date must be in the future');
    }

    // Validate rental dates if applicable
    if (dto.type === 'RENT' || dto.type === 'PURCHASE') {
      if (!dto.checkIn || !dto.checkOut) {
        throw new ValidationError('Check-in and check-out dates are required for rental bookings');
      }
      if (new Date(dto.checkIn) >= new Date(dto.checkOut)) {
        throw new ValidationError('Check-out date must be after check-in date');
      }
    }

    const booking = await this.bookingRepo.create({
      ...dto,
      customerId,
      brokerId,
    });

    logger.info(`Booking created: ${booking.id} by customer ${customerId}`);

    return booking;
  }

  async getBookingById(id: string, userId: string): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(id);

    if (!booking) throw new NotFoundError('Booking', id);

    if (booking.customerId !== userId && booking.brokerId !== userId) {
      throw new ForbiddenError('You are not authorized to view this booking');
    }

    return booking;
  }

  async getCustomerBookings(customerId: string, status?: BookingStatus): Promise<IBooking[]> {
    return this.bookingRepo.findByCustomer(customerId, status);
  }

  async getBrokerBookings(brokerId: string, status?: BookingStatus): Promise<IBooking[]> {
    return this.bookingRepo.findByBroker(brokerId, status);
  }

  async confirmBooking(bookingId: string, brokerId: string): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) throw new NotFoundError('Booking', bookingId);
    if (booking.brokerId !== brokerId) {
      throw new ForbiddenError('Only the broker can confirm this booking');
    }
    if (booking.status !== 'PENDING') {
      throw new ValidationError(`Cannot confirm a booking with status: ${booking.status}`);
    }

    await this.bookingRepo.updateStatus(bookingId, 'CONFIRMED');

    logger.info(`Booking confirmed: ${bookingId}`);
    return (await this.bookingRepo.findById(bookingId))!;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string,
  ): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) throw new NotFoundError('Booking', bookingId);

    if (booking.customerId !== userId && booking.brokerId !== userId) {
      throw new ForbiddenError('You are not authorized to cancel this booking');
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new ValidationError(`Cannot cancel a booking with status: ${booking.status}`);
    }

    await this.bookingRepo.updateStatus(bookingId, 'CANCELLED', {
      cancelReason: reason,
      cancelledBy: userId,
    });

    logger.info(`Booking cancelled: ${bookingId} by ${userId}`);
    return (await this.bookingRepo.findById(bookingId))!;
  }

  async completeBooking(bookingId: string, brokerId: string): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) throw new NotFoundError('Booking', bookingId);
    if (booking.brokerId !== brokerId) {
      throw new ForbiddenError('Only the broker can complete this booking');
    }
    if (booking.status !== 'CONFIRMED') {
      throw new ValidationError('Booking must be confirmed before completing');
    }

    await this.bookingRepo.updateStatus(bookingId, 'COMPLETED');
    return (await this.bookingRepo.findById(bookingId))!;
  }
}
