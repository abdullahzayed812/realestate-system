export type NotificationType =
  | 'NEW_MESSAGE' | 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED' | 'PROPERTY_APPROVED' | 'PROPERTY_REJECTED'
  | 'NEW_PROPERTY' | 'PRICE_DROP' | 'VISIT_REMINDER'
  | 'SUBSCRIPTION_EXPIRY' | 'SYSTEM' | 'PROMOTION';

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}
