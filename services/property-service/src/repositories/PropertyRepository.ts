import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import {
  IProperty, IPropertyFull, IPropertyFilter,
  PropertyType, ListingType, PropertyStatus,
} from '@realestate/types';
import { generateUuid } from '@realestate/utils';
import { parsePagination, buildPaginationMeta, IPaginatedResponse } from '@realestate/utils';

interface PropertyRow extends IProperty, RowDataPacket {}

export interface ICreatePropertyData {
  brokerId: string;
  companyId?: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  currency?: string;
  pricePer?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  parkingSpaces?: number;
  furnished?: string;
  condition?: string;
  yearBuilt?: number;
}

export class PropertyRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findBrokerIdByUserId(userId: string): Promise<string | null> {
    const { rows } = await this.db.execute<RowDataPacket>(
      'SELECT id FROM brokers WHERE user_id = ? AND deleted_at IS NULL LIMIT 1',
      [userId],
    );
    return rows[0]?.id ?? null;
  }

  async findById(id: string): Promise<IProperty | null> {
    const { rows } = await this.db.execute<PropertyRow>(
      `SELECT id, broker_id AS brokerId, company_id AS companyId,
              title, title_ar AS titleAr, description, description_ar AS descriptionAr,
              type, listing_type AS listingType, status, price, currency,
              price_per AS pricePer, area, bedrooms, bathrooms, floor,
              total_floors AS totalFloors, parking_spaces AS parkingSpaces,
              furnished, \`condition\`, year_built AS yearBuilt,
              is_featured AS isFeatured, is_verified AS isVerified,
              views_count AS viewsCount, favorites_count AS favoritesCount,
              expires_at AS expiresAt, created_at AS createdAt, updated_at AS updatedAt
       FROM properties WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] || null;
  }

  async findFullById(id: string): Promise<IPropertyFull | null> {
    const property = await this.findById(id);
    if (!property) return null;

    const [images, videos, features, location, broker] = await Promise.all([
      this.findImages(id),
      this.findVideos(id),
      this.findFeatures(id),
      this.findLocation(id),
      this.findBrokerInfo(property.brokerId),
    ]);

    return { ...property, images, videos, features, location: location!, broker };
  }

  private async findImages(propertyId: string): Promise<IPropertyFull['images']> {
    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT id, property_id AS propertyId, url, thumbnail_url AS thumbnailUrl,
              alt_text AS altText, sort_order AS sortOrder, is_primary AS isPrimary,
              size_bytes AS sizeBytes, width, height, created_at AS createdAt
       FROM property_images WHERE property_id = ? ORDER BY sort_order ASC`,
      [propertyId],
    );
    return rows as IPropertyFull['images'];
  }

  private async findVideos(propertyId: string): Promise<IPropertyFull['videos']> {
    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT id, property_id AS propertyId, url, thumbnail_url AS thumbnailUrl,
              duration, size_bytes AS sizeBytes, sort_order AS sortOrder, created_at AS createdAt
       FROM property_videos WHERE property_id = ? ORDER BY sort_order ASC`,
      [propertyId],
    );
    return rows as IPropertyFull['videos'];
  }

  private async findFeatures(propertyId: string): Promise<IPropertyFull['features']> {
    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT id, property_id AS propertyId, feature, feature_ar AS featureAr, category
       FROM property_features WHERE property_id = ?`,
      [propertyId],
    );
    return rows as IPropertyFull['features'];
  }

  private async findLocation(propertyId: string): Promise<IPropertyFull['location'] | null> {
    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT id, property_id AS propertyId, latitude, longitude,
              address, address_ar AS addressAr, city, district,
              neighborhood, postal_code AS postalCode, country,
              google_place_id AS googlePlaceId
       FROM property_locations WHERE property_id = ?`,
      [propertyId],
    );
    return (rows[0] as IPropertyFull['location']) || null;
  }

  private async findBrokerInfo(brokerId: string): Promise<IPropertyFull['broker']> {
    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT b.id, b.user_id AS userId, b.rating, b.is_verified AS isVerified,
              u.first_name AS firstName, u.last_name AS lastName,
              u.phone, u.avatar_url AS avatarUrl
       FROM brokers b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ? AND b.deleted_at IS NULL`,
      [brokerId],
    );
    if (!rows[0]) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      rating: row.rating,
      isVerified: row.isVerified,
      user: {
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone,
        avatarUrl: row.avatarUrl,
      },
    };
  }

  async findMany(
    filter: IPropertyFilter,
    page: number,
    limit: number,
  ): Promise<{ data: IProperty[]; total: number }> {
    const { conditions, params } = this.buildFilterConditions(filter);
    const offset = (page - 1) * limit;
    const orderClause = this.buildOrderClause(filter.sortBy);

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM properties p
      LEFT JOIN property_locations pl ON p.id = pl.property_id
      WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE'
      ${conditions}
    `;

    const dataQuery = `
      SELECT p.id, p.broker_id AS brokerId, p.company_id AS companyId,
             p.title, p.title_ar AS titleAr, p.type, p.listing_type AS listingType,
             p.status, p.price, p.currency, p.price_per AS pricePer,
             p.area, p.bedrooms, p.bathrooms, p.furnished,
             p.is_featured AS isFeatured, p.is_verified AS isVerified,
             p.views_count AS viewsCount, p.favorites_count AS favoritesCount,
             p.created_at AS createdAt, p.updated_at AS updatedAt,
             pl.latitude, pl.longitude, pl.city, pl.district, pl.address,
             (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primaryImage
      FROM properties p
      LEFT JOIN property_locations pl ON p.id = pl.property_id
      WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE'
      ${conditions}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const [countResult, dataResult] = await Promise.all([
      this.db.query<RowDataPacket>(countQuery, params),
      this.db.query<PropertyRow>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      data: dataResult.rows as IProperty[],
      total: (countResult.rows[0] as RowDataPacket)?.total || 0,
    };
  }

  async findManyAdmin(
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: IProperty[]; total: number }> {
    const offset = (page - 1) * limit;
    const statusClause = status ? 'AND p.status = ?' : '';
    const params: unknown[] = status ? [status] : [];

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM properties p
      WHERE p.deleted_at IS NULL ${statusClause}
    `;

    const dataQuery = `
      SELECT p.id, p.broker_id AS brokerId, p.company_id AS companyId,
             p.title, p.title_ar AS titleAr, p.type, p.listing_type AS listingType,
             p.status, p.price, p.currency, p.price_per AS pricePer,
             p.area, p.bedrooms, p.bathrooms, p.furnished,
             p.is_featured AS isFeatured, p.is_verified AS isVerified,
             p.views_count AS viewsCount, p.favorites_count AS favoritesCount,
             p.created_at AS createdAt, p.updated_at AS updatedAt,
             pl.city, pl.district, pl.address,
             (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primaryImage
      FROM properties p
      LEFT JOIN property_locations pl ON p.id = pl.property_id
      WHERE p.deleted_at IS NULL ${statusClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, dataResult] = await Promise.all([
      this.db.query<RowDataPacket>(countQuery, params),
      this.db.query<PropertyRow>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      data: dataResult.rows as IProperty[],
      total: (countResult.rows[0] as RowDataPacket)?.total || 0,
    };
  }

  private buildFilterConditions(filter: IPropertyFilter): {
    conditions: string;
    params: unknown[];
  } {
    const parts: string[] = [];
    const params: unknown[] = [];

    if (filter.type) {
      if (Array.isArray(filter.type)) {
        parts.push(`p.type IN (${filter.type.map(() => '?').join(',')})`);
        params.push(...filter.type);
      } else {
        parts.push('p.type = ?');
        params.push(filter.type);
      }
    }

    if (filter.listingType) {
      parts.push('p.listing_type = ?');
      params.push(filter.listingType);
    }

    if (filter.minPrice !== undefined) {
      parts.push('p.price >= ?');
      params.push(filter.minPrice);
    }

    if (filter.maxPrice !== undefined) {
      parts.push('p.price <= ?');
      params.push(filter.maxPrice);
    }

    if (filter.minArea !== undefined) {
      parts.push('p.area >= ?');
      params.push(filter.minArea);
    }

    if (filter.maxArea !== undefined) {
      parts.push('p.area <= ?');
      params.push(filter.maxArea);
    }

    if (filter.bedrooms !== undefined) {
      parts.push('p.bedrooms = ?');
      params.push(filter.bedrooms);
    }

    if (filter.bathrooms !== undefined) {
      parts.push('p.bathrooms = ?');
      params.push(filter.bathrooms);
    }

    if (filter.furnished) {
      parts.push('p.furnished = ?');
      params.push(filter.furnished);
    }

    if (filter.city) {
      parts.push('pl.city LIKE ?');
      params.push(`%${filter.city}%`);
    }

    if (filter.district) {
      parts.push('pl.district LIKE ?');
      params.push(`%${filter.district}%`);
    }

    if (filter.isFeatured !== undefined) {
      parts.push('p.is_featured = ?');
      params.push(filter.isFeatured);
    }

    if (filter.brokerId) {
      parts.push('p.broker_id = ?');
      params.push(filter.brokerId);
    }

    if (filter.companyId) {
      parts.push('p.company_id = ?');
      params.push(filter.companyId);
    }

    if (filter.search) {
      parts.push('MATCH(p.title, p.description, p.title_ar, p.description_ar) AGAINST(? IN BOOLEAN MODE)');
      params.push(`${filter.search}*`);
    }

    // Geo-radius search
    if (filter.lat !== undefined && filter.lng !== undefined && filter.radius !== undefined) {
      parts.push(`
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(pl.latitude))
        )) <= ?
      `);
      params.push(filter.lat, filter.lng, filter.lat, filter.radius);
    }

    return {
      conditions: parts.length > 0 ? `AND ${parts.join(' AND ')}` : '',
      params,
    };
  }

  private buildOrderClause(sortBy?: string): string {
    const orderMap: Record<string, string> = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      area_asc: 'p.area ASC',
      area_desc: 'p.area DESC',
    };

    const order = sortBy && orderMap[sortBy] ? orderMap[sortBy] : 'p.is_featured DESC, p.created_at DESC';
    return `ORDER BY ${order}`;
  }

  async create(data: ICreatePropertyData): Promise<IProperty> {
    const id = generateUuid();
    await this.db.executeModify(
      `INSERT INTO properties (
        id, broker_id, company_id, title, title_ar, description, description_ar,
        type, listing_type, price, currency, price_per, area, bedrooms, bathrooms,
        floor, total_floors, parking_spaces, furnished, \`condition\`, year_built
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.brokerId, data.companyId || null,
        data.title, data.titleAr || null,
        data.description, data.descriptionAr || null,
        data.type, data.listingType,
        data.price, data.currency || 'EGP', data.pricePer || 'TOTAL',
        data.area, data.bedrooms || null, data.bathrooms || null,
        data.floor || null, data.totalFloors || null, data.parkingSpaces || 0,
        data.furnished || null, data.condition || null, data.yearBuilt || null,
      ],
    );
    return (await this.findById(id))!;
  }

  async addLocation(
    propertyId: string,
    location: {
      latitude: number;
      longitude: number;
      address: string;
      addressAr?: string;
      city?: string;
      district?: string;
      neighborhood?: string;
      googlePlaceId?: string;
    },
  ): Promise<void> {
    await this.db.executeModify(
      `INSERT INTO property_locations
         (id, property_id, latitude, longitude, address, address_ar, city, district, neighborhood, google_place_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         latitude = VALUES(latitude), longitude = VALUES(longitude),
         address = VALUES(address), address_ar = VALUES(address_ar),
         city = VALUES(city), district = VALUES(district)`,
      [
        generateUuid(), propertyId,
        location.latitude, location.longitude,
        location.address, location.addressAr || null,
        location.city || 'Borg El Arab', location.district || null,
        location.neighborhood || null, location.googlePlaceId || null,
      ],
    );
  }

  async addImage(
    propertyId: string,
    imageData: { url: string; thumbnailUrl?: string; isPrimary?: boolean; sortOrder?: number },
  ): Promise<void> {
    if (imageData.isPrimary) {
      await this.db.executeModify(
        'UPDATE property_images SET is_primary = FALSE WHERE property_id = ?',
        [propertyId],
      );
    }
    await this.db.executeModify(
      `INSERT INTO property_images (id, property_id, url, thumbnail_url, is_primary, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generateUuid(), propertyId,
        imageData.url, imageData.thumbnailUrl || null,
        imageData.isPrimary || false, imageData.sortOrder || 0,
      ],
    );
  }

  async addFeatures(
    propertyId: string,
    features: Array<{ feature: string; featureAr?: string; category: string }>,
  ): Promise<void> {
    if (!features.length) return;
    const values = features.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const params = features.flatMap((f) => [
      generateUuid(), propertyId, f.feature, f.featureAr || null, f.category,
    ]);
    await this.db.executeModify(
      `INSERT INTO property_features (id, property_id, feature, feature_ar, category) VALUES ${values}`,
      params,
    );
  }

  async updateStatus(id: string, status: PropertyStatus, adminId?: string, reason?: string): Promise<void> {
    await this.db.executeModify(
      `UPDATE properties SET status = ?, approved_by = ?, approved_at = IF(? = 'ACTIVE', NOW(), NULL),
       rejection_reason = ? WHERE id = ?`,
      [status, adminId || null, status, reason || null, id],
    );
  }

  async update(id: string, data: Partial<ICreatePropertyData>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      title: 'title', titleAr: 'title_ar', description: 'description',
      descriptionAr: 'description_ar', price: 'price', area: 'area',
      bedrooms: 'bedrooms', bathrooms: 'bathrooms', floor: 'floor',
      furnished: 'furnished', parkingSpaces: 'parking_spaces',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      const val = (data as Record<string, unknown>)[key];
      if (val !== undefined) {
        fields.push(`${column} = ?`);
        values.push(val);
      }
    }

    if (!fields.length) return;
    values.push(id);
    await this.db.executeModify(
      `UPDATE properties SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async incrementViews(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE properties SET views_count = views_count + 1 WHERE id = ?',
      [id],
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE properties SET deleted_at = NOW(), status = "SUSPENDED" WHERE id = ?',
      [id],
    );
  }

  async findByBroker(brokerId: string, status?: PropertyStatus): Promise<IProperty[]> {
    const statusClause = status ? 'AND status = ?' : '';
    const params: unknown[] = [brokerId];
    if (status) params.push(status);

    const { rows } = await this.db.execute<PropertyRow>(
      `SELECT id, broker_id AS brokerId, title, title_ar AS titleAr,
              type, listing_type AS listingType, status,
              price, currency, area, bedrooms, bathrooms,
              is_featured AS isFeatured, is_verified AS isVerified,
              views_count AS viewsCount, favorites_count AS favoritesCount,
              created_at AS createdAt, updated_at AS updatedAt
       FROM properties
       WHERE broker_id = ? AND deleted_at IS NULL ${statusClause}
       ORDER BY created_at DESC`,
      params,
    );
    return rows;
  }
}
