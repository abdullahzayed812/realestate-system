import {
  IProperty, IPropertyFull, IPropertyFilter,
  PropertyStatus,
} from '@realestate/types';
import { NotFoundError, ForbiddenError } from '@realestate/errors';
import { RedisConnection } from '@realestate/database';
import { parsePagination, buildPaginationMeta, createLogger } from '@realestate/utils';
import { IPaginationQuery, IPaginatedResponse } from '@realestate/types';
import {
  PropertyRepository,
  ICreatePropertyData,
} from '../repositories/PropertyRepository';
import { FavoriteRepository } from '../repositories/FavoriteRepository';

const logger = createLogger('PropertyService');
const CACHE_TTL = 300; // 5 minutes

export class PropertyService {
  private propertyRepo: PropertyRepository;
  private favoriteRepo: FavoriteRepository;
  private redis: RedisConnection;

  constructor() {
    this.propertyRepo = new PropertyRepository();
    this.favoriteRepo = new FavoriteRepository();
    this.redis = RedisConnection.getInstance();
  }

  async createProperty(
    data: ICreatePropertyData & {
      location: {
        latitude: number;
        longitude: number;
        address: string;
        addressAr?: string;
        city?: string;
        district?: string;
        googlePlaceId?: string;
      };
      features?: Array<{ feature: string; featureAr?: string; category: string }>;
    },
  ): Promise<IProperty> {
    const property = await this.propertyRepo.create(data);

    await this.propertyRepo.addLocation(property.id, data.location);

    if (data.features?.length) {
      await this.propertyRepo.addFeatures(property.id, data.features);
    }

    logger.info(`Property created: ${property.id} by broker ${data.brokerId}`);

    return property;
  }

  async getPropertyById(id: string, userId?: string): Promise<IPropertyFull> {
    const cacheKey = `property:${id}`;
    const cached = await this.redis.getJson<IPropertyFull>(cacheKey);

    if (cached) {
      await this.propertyRepo.incrementViews(id);
      return cached;
    }

    const property = await this.propertyRepo.findFullById(id);

    if (!property) {
      throw new NotFoundError('Property', id);
    }

    await Promise.all([
      this.redis.setJson(cacheKey, property, CACHE_TTL),
      this.propertyRepo.incrementViews(id),
    ]);

    return property;
  }

  async searchProperties(
    filter: IPropertyFilter,
    pagination: IPaginationQuery,
    userId?: string,
  ): Promise<IPaginatedResponse<IProperty>> {
    const { page, limit } = parsePagination(pagination);

    const { data, total } = await this.propertyRepo.findMany(filter, page, limit);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getFeaturedProperties(): Promise<IProperty[]> {
    const cacheKey = 'properties:featured';
    const cached = await this.redis.getJson<IProperty[]>(cacheKey);
    if (cached) return cached;

    const { data } = await this.propertyRepo.findMany(
      { isFeatured: true },
      1,
      10,
    );

    await this.redis.setJson(cacheKey, data, CACHE_TTL);
    return data;
  }

  async updateProperty(
    id: string,
    brokerId: string,
    data: Partial<ICreatePropertyData>,
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findById(id);

    if (!property) throw new NotFoundError('Property', id);
    if (property.brokerId !== brokerId) {
      throw new ForbiddenError('You are not authorized to edit this property');
    }

    await this.propertyRepo.update(id, data);

    // Invalidate cache
    await this.redis.del(`property:${id}`);

    return (await this.propertyRepo.findById(id))!;
  }

  async deleteProperty(id: string, brokerId: string, isAdmin = false): Promise<void> {
    const property = await this.propertyRepo.findById(id);

    if (!property) throw new NotFoundError('Property', id);
    if (!isAdmin && property.brokerId !== brokerId) {
      throw new ForbiddenError('You are not authorized to delete this property');
    }

    await this.propertyRepo.softDelete(id);
    await this.redis.del(`property:${id}`);

    logger.info(`Property deleted: ${id}`);
  }

  async approveProperty(id: string, adminId: string): Promise<void> {
    const property = await this.propertyRepo.findById(id);
    if (!property) throw new NotFoundError('Property', id);

    await this.propertyRepo.updateStatus(id, 'ACTIVE', adminId);
    await this.redis.del(`property:${id}`);
    await this.redis.del('properties:featured');

    logger.info(`Property approved: ${id} by admin ${adminId}`);
  }

  async rejectProperty(id: string, adminId: string, reason: string): Promise<void> {
    const property = await this.propertyRepo.findById(id);
    if (!property) throw new NotFoundError('Property', id);

    await this.propertyRepo.updateStatus(id, 'REJECTED', adminId, reason);
    await this.redis.del(`property:${id}`);

    logger.info(`Property rejected: ${id}`);
  }

  async getBrokerProperties(brokerId: string, status?: PropertyStatus): Promise<IProperty[]> {
    return this.propertyRepo.findByBroker(brokerId, status);
  }

  async toggleFavorite(userId: string, propertyId: string): Promise<{ isFavorited: boolean }> {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) throw new NotFoundError('Property', propertyId);

    const isFavorited = await this.favoriteRepo.toggle(userId, propertyId);
    return { isFavorited };
  }

  async getUserFavorites(
    userId: string,
    pagination: IPaginationQuery,
  ): Promise<IPaginatedResponse<IProperty>> {
    const { page, limit } = parsePagination(pagination);
    const { data, total } = await this.favoriteRepo.findByUser(userId, page, limit);
    return { data, meta: buildPaginationMeta(total, page, limit) };
  }
}
