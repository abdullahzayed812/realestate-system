export type BookingType = 'VISIT' | 'RENT' | 'PURCHASE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface IBooking {
  id: string;
  propertyId: string;
  customerId: string;
  brokerId: string;
  type: BookingType;
  status: BookingStatus;
  scheduledAt: Date;
  duration: number | null;
  checkIn: Date | null;
  checkOut: Date | null;
  totalPrice: number | null;
  notes: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  cancelledAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBookingDto {
  propertyId: string;
  type: BookingType;
  scheduledAt: string;
  duration?: number;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}
