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

  async findByCustomer(customerId: string, status?: BookingStatus): Promise<any[]> {
    const params: unknown[] = [customerId];
    const statusClause = status ? 'AND b.status = ?' : '';
    if (status) params.push(status);

    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT
         b.id, b.property_id AS propertyId, b.customer_id AS customerId,
         b.broker_id AS brokerId, b.type, b.status,
         b.scheduled_at AS scheduledAt,
         DATE(b.scheduled_at) AS scheduledDate,
         TIME(b.scheduled_at) AS scheduledTime,
         b.duration, b.check_in AS checkIn, b.check_out AS checkOut,
         b.total_price AS totalPrice, b.notes AS message, b.created_at AS createdAt,
         p.title_ar AS propertyTitleAr,
         u.first_name AS brokerFirstName,
         u.last_name AS brokerLastName,
         u.phone AS brokerPhone
       FROM bookings b
       LEFT JOIN properties p ON p.id = b.property_id
       LEFT JOIN users u ON u.id = b.broker_id
       WHERE b.customer_id = ? ${statusClause}
       ORDER BY b.scheduled_at DESC`,
      params,
    );

    return rows.map((row: any) => ({
      id: row.id,
      propertyId: row.propertyId,
      customerId: row.customerId,
      brokerId: row.brokerId,
      type: row.type,
      status: row.status,
      scheduledAt: row.scheduledAt,
      scheduledDate: row.scheduledDate,
      scheduledTime: row.scheduledTime,
      duration: row.duration,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      totalPrice: row.totalPrice,
      message: row.message,
      createdAt: row.createdAt,
      property: { titleAr: row.propertyTitleAr },
      broker: {
        firstName: row.brokerFirstName,
        lastName: row.brokerLastName,
        phone: row.brokerPhone,
      },
    }));
  }

  async findByBroker(brokerId: string, status?: BookingStatus): Promise<any[]> {
    const params: unknown[] = [brokerId];
    const statusClause = status ? 'AND b.status = ?' : '';
    if (status) params.push(status);

    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT
         b.id, b.property_id AS propertyId, b.customer_id AS customerId,
         b.broker_id AS brokerId, b.type, b.status,
         b.scheduled_at AS scheduledAt,
         DATE(b.scheduled_at) AS scheduledDate,
         TIME(b.scheduled_at) AS scheduledTime,
         b.duration, b.notes AS message, b.created_at AS createdAt,
         p.title_ar AS propertyTitleAr,
         u.first_name AS customerFirstName,
         u.last_name AS customerLastName,
         u.phone AS customerPhone
       FROM bookings b
       LEFT JOIN properties p ON p.id = b.property_id
       LEFT JOIN users u ON u.id = b.customer_id
       WHERE b.broker_id = ? ${statusClause}
       ORDER BY b.scheduled_at ASC`,
      params,
    );

    return rows.map((row: any) => ({
      id: row.id,
      propertyId: row.propertyId,
      customerId: row.customerId,
      brokerId: row.brokerId,
      type: row.type,
      status: row.status,
      scheduledAt: row.scheduledAt,
      scheduledDate: row.scheduledDate,
      scheduledTime: row.scheduledTime,
      duration: row.duration,
      message: row.message,
      createdAt: row.createdAt,
      property: { titleAr: row.propertyTitleAr },
      customer: {
        firstName: row.customerFirstName,
        lastName: row.customerLastName,
        phone: row.customerPhone,
      },
    }));
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

  async resolveBrokerUserId(brokerId: string): Promise<string | null> {
    const { rows } = await this.db.execute<RowDataPacket>(
      'SELECT user_id FROM brokers WHERE id = ?',
      [brokerId],
    );
    return (rows[0] as any)?.user_id ?? null;
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
