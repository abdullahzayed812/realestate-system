import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { IProperty } from '@realestate/types';
import { generateUuid } from '@realestate/utils';

export class FavoriteRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async toggle(userId: string, propertyId: string): Promise<boolean> {
    const existing = await this.db.execute<RowDataPacket>(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId],
    );

    if (existing.rows.length > 0) {
      await this.db.executeModify(
        'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
        [userId, propertyId],
      );
      await this.db.executeModify(
        'UPDATE properties SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = ?',
        [propertyId],
      );
      return false;
    } else {
      await this.db.executeModify(
        'INSERT INTO favorites (id, user_id, property_id) VALUES (?, ?, ?)',
        [generateUuid(), userId, propertyId],
      );
      await this.db.executeModify(
        'UPDATE properties SET favorites_count = favorites_count + 1 WHERE id = ?',
        [propertyId],
      );
      return true;
    }
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const { rows } = await this.db.execute<RowDataPacket>(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId],
    );
    return rows.length > 0;
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IProperty[]; total: number }> {
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      this.db.execute<RowDataPacket>(
        'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
        [userId],
      ),
      this.db.execute<RowDataPacket>(
        `SELECT p.id, p.broker_id AS brokerId, p.title, p.title_ar AS titleAr,
                p.type, p.listing_type AS listingType, p.status, p.price, p.currency,
                p.area, p.bedrooms, p.bathrooms, p.is_featured AS isFeatured,
                p.created_at AS createdAt,
                (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primaryImage
         FROM favorites f
         JOIN properties p ON f.property_id = p.id
         WHERE f.user_id = ? AND p.deleted_at IS NULL
         ORDER BY f.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset],
      ),
    ]);

    return {
      data: dataResult.rows as unknown as IProperty[],
      total: countResult.rows[0]?.total || 0,
    };
  }
}
