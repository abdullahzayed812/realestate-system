import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { IUser, UserRole } from '@realestate/types';
import { generateUuid } from '@realestate/utils';

interface UserRow extends IUser, RowDataPacket {}

export interface ICreateUserData {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
}

export class UserRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findById(id: string): Promise<IUser | null> {
    const { rows } = await this.db.execute<UserRow>(
      `SELECT id, phone, email, first_name AS firstName, last_name AS lastName,
              avatar_url AS avatarUrl, role, is_active AS isActive,
              is_verified AS isVerified, phone_verified AS phoneVerified,
              email_verified AS emailVerified, last_login_at AS lastLoginAt,
              preferred_lang AS preferredLang, fcm_token AS fcmToken,
              created_at AS createdAt, updated_at AS updatedAt, deleted_at AS deletedAt
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] || null;
  }

  async findByPhone(phone: string): Promise<(IUser & { passwordHash?: string }) | null> {
    const { rows } = await this.db.execute<UserRow>(
      `SELECT id, phone, email, password_hash AS passwordHash,
              first_name AS firstName, last_name AS lastName,
              avatar_url AS avatarUrl, role, is_active AS isActive,
              is_verified AS isVerified, phone_verified AS phoneVerified,
              email_verified AS emailVerified, last_login_at AS lastLoginAt,
              preferred_lang AS preferredLang, fcm_token AS fcmToken,
              created_at AS createdAt, updated_at AS updatedAt, deleted_at AS deletedAt
       FROM users WHERE phone = ? AND deleted_at IS NULL`,
      [phone],
    );
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const { rows } = await this.db.execute<UserRow>(
      `SELECT id, phone, email, first_name AS firstName, last_name AS lastName,
              avatar_url AS avatarUrl, role, is_active AS isActive,
              is_verified AS isVerified, phone_verified AS phoneVerified,
              email_verified AS emailVerified, last_login_at AS lastLoginAt,
              preferred_lang AS preferredLang,
              created_at AS createdAt, updated_at AS updatedAt
       FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email],
    );
    return rows[0] || null;
  }

  async create(data: ICreateUserData): Promise<IUser> {
    const id = generateUuid();
    await this.db.executeModify(
      `INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.phone,
        data.email || null,
        data.passwordHash || null,
        data.firstName,
        data.lastName,
        data.role || 'CUSTOMER',
      ],
    );
    return (await this.findById(id))!;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [id],
    );
  }

  async updateFcmToken(id: string, token: string | null): Promise<void> {
    await this.db.executeModify(
      'UPDATE users SET fcm_token = ? WHERE id = ?',
      [token, id],
    );
  }

  async updatePhoneVerified(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE users SET phone_verified = TRUE, is_verified = TRUE WHERE id = ?',
      [id],
    );
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName); }
    if (data.lastName !== undefined) { fields.push('last_name = ?'); values.push(data.lastName); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.avatarUrl !== undefined) { fields.push('avatar_url = ?'); values.push(data.avatarUrl); }
    if (data.preferredLang !== undefined) { fields.push('preferred_lang = ?'); values.push(data.preferredLang); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db.executeModify(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE users SET deleted_at = NOW() WHERE id = ?',
      [id],
    );
  }
}
