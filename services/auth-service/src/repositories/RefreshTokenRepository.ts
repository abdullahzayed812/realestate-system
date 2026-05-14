import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { generateUuid, hashToken } from '@realestate/utils';

interface RefreshTokenRow extends RowDataPacket {
  id: string;
  userId: string;
  tokenHash: string;
  deviceId: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export class RefreshTokenRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: { deviceId?: string; deviceType?: string; ipAddress?: string },
  ): Promise<void> {
    const tokenHash = hashToken(token);
    await this.db.executeModify(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, device_id, device_type, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUuid(),
        userId,
        tokenHash,
        deviceInfo?.deviceId || null,
        deviceInfo?.deviceType || null,
        deviceInfo?.ipAddress || null,
        expiresAt,
      ],
    );
  }

  async findByToken(token: string): Promise<RefreshTokenRow | null> {
    const tokenHash = hashToken(token);
    const { rows } = await this.db.execute<RefreshTokenRow>(
      `SELECT id, user_id AS userId, token_hash AS tokenHash,
              device_id AS deviceId, device_type AS deviceType,
              ip_address AS ipAddress, expires_at AS expiresAt,
              revoked_at AS revokedAt, created_at AS createdAt
       FROM refresh_tokens
       WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()`,
      [tokenHash],
    );
    return rows[0] || null;
  }

  async revoke(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await this.db.executeModify(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?',
      [tokenHash],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
      [userId],
    );
  }

  async cleanExpired(): Promise<void> {
    await this.db.executeModify(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()',
    );
  }
}
