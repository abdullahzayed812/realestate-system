import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { IBooking, BookingStatus, ICreateBookingDto } from '@realestate/types';
import { generateUuid } from '@realestate/utils';

interface BookingRow extends IBooking, RowDataPacket {}

export class BookingRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(
    data: ICreateBookingDto & { customerId: string; brokerId: string },
  ): Promise<IBooking> {
    const id = generateUuid();

    await this.db.executeModify(
      `INSERT INTO bookings (
        id, property_id, customer_id, broker_id, type, scheduled_at,
        duration, check_in, check_out, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.propertyId,
        data.customerId,
        data.brokerId,
        data.type,
        new Date(data.scheduledAt),
        data.duration || null,
        data.checkIn ? new Date(data.checkIn) : null,
        data.checkOut ? new Date(data.checkOut) : null,
        data.notes || null,
      ],
    );

    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<IBooking | null> {
    const { rows } = await this.db.execute<BookingRow>(
      `SELECT id, property_id AS propertyId, customer_id AS customerId,
              broker_id AS brokerId, type, status, scheduled_at AS scheduledAt,
              duration, check_in AS checkIn, check_out AS checkOut,
              total_price AS totalPrice, notes, cancel_reason AS cancelReason,
              cancelled_by AS cancelledBy, cancelled_at AS cancelledAt,
              confirmed_at AS confirmedAt, completed_at AS completedAt,
              reminder_sent AS reminderSent, created_at AS createdAt,
              updated_at AS updatedAt
       FROM bookings WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async findByCustomer(customerId: string, status?: BookingStatus): Promise<IBooking[]> {
    const params: unknown[] = [customerId];
    const statusClause = status ? 'AND status = ?' : '';
    if (status) params.push(status);

    const { rows } = await this.db.execute<BookingRow>(
      `SELECT id, property_id AS propertyId, customer_id AS customerId,
              broker_id AS brokerId, type, status, scheduled_at AS scheduledAt,
              duration, check_in AS checkIn, check_out AS checkOut,
              total_price AS totalPrice, notes, created_at AS createdAt
       FROM bookings WHERE customer_id = ? ${statusClause}
       ORDER BY scheduled_at DESC`,
      params,
    );
    return rows;
  }

  async findByBroker(brokerId: string, status?: BookingStatus): Promise<IBooking[]> {
    const params: unknown[] = [brokerId];
    const statusClause = status ? 'AND status = ?' : '';
    if (status) params.push(status);

    const { rows } = await this.db.execute<BookingRow>(
      `SELECT id, property_id AS propertyId, customer_id AS customerId,
              broker_id AS brokerId, type, status, scheduled_at AS scheduledAt,
              duration, notes, created_at AS createdAt
       FROM bookings WHERE broker_id = ? ${statusClause}
       ORDER BY scheduled_at ASC`,
      params,
    );
    return rows;
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    extra?: {
      cancelReason?: string;
      cancelledBy?: string;
      totalPrice?: number;
    },
  ): Promise<void> {
    const now = new Date();
    const fields: string[] = ['status = ?'];
    const params: unknown[] = [status];

    if (status === 'CANCELLED') {
      fields.push('cancelled_at = ?', 'cancel_reason = ?', 'cancelled_by = ?');
      params.push(now, extra?.cancelReason || null, extra?.cancelledBy || null);
    } else if (status === 'CONFIRMED') {
      fields.push('confirmed_at = ?');
      params.push(now);
    } else if (status === 'COMPLETED') {
      fields.push('completed_at = ?');
      params.push(now);
    }

    if (extra?.totalPrice !== undefined) {
      fields.push('total_price = ?');
      params.push(extra.totalPrice);
    }

    params.push(id);
    await this.db.executeModify(
      `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );
  }

  async findUpcomingReminders(): Promise<IBooking[]> {
    const { rows } = await this.db.execute<BookingRow>(
      `SELECT id, property_id AS propertyId, customer_id AS customerId,
              broker_id AS brokerId, type, scheduled_at AS scheduledAt
       FROM bookings
       WHERE status = 'CONFIRMED'
         AND reminder_sent = FALSE
         AND scheduled_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`,
    );
    return rows;
  }

  async markReminderSent(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE bookings SET reminder_sent = TRUE WHERE id = ?',
      [id],
    );
  }
}
