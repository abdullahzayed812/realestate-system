import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { OtpPurpose } from '@realestate/types';
import { generateUuid } from '@realestate/utils';

interface OtpRow extends RowDataPacket {
  id: string;
  phone: string;
  otpCode: string;
  purpose: OtpPurpose;
  isUsed: boolean;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

export class OtpRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(
    phone: string,
    otpCode: string,
    purpose: OtpPurpose,
    expiresInMinutes: number,
  ): Promise<void> {
    await this.db.executeModify(
      `INSERT INTO otp_verifications (id, phone, otp_code, purpose, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [generateUuid(), phone, otpCode, purpose, expiresInMinutes],
    );
  }

  async findLatestValid(phone: string, purpose: OtpPurpose): Promise<OtpRow | null> {
    const { rows } = await this.db.execute<OtpRow>(
      `SELECT id, phone, otp_code AS otpCode, purpose, is_used AS isUsed,
              attempts, expires_at AS expiresAt, created_at AS createdAt
       FROM otp_verifications
       WHERE phone = ? AND purpose = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, purpose],
    );
    return rows[0] || null;
  }

  async incrementAttempts(id: string): Promise<number> {
    await this.db.executeModify(
      'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?',
      [id],
    );
    const { rows } = await this.db.execute<RowDataPacket>(
      'SELECT attempts FROM otp_verifications WHERE id = ?',
      [id],
    );
    return rows[0]?.attempts || 0;
  }

  async markUsed(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE otp_verifications SET is_used = TRUE WHERE id = ?',
      [id],
    );
  }

  async invalidatePrevious(phone: string, purpose: OtpPurpose): Promise<void> {
    await this.db.executeModify(
      `UPDATE otp_verifications SET is_used = TRUE
       WHERE phone = ? AND purpose = ? AND is_used = FALSE`,
      [phone, purpose],
    );
  }

  async cleanExpired(): Promise<void> {
    await this.db.executeModify(
      'DELETE FROM otp_verifications WHERE expires_at < NOW()',
    );
  }
}
