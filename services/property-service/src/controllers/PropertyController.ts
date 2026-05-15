import { Request, Response } from 'express';
import { PropertyService } from '../services/PropertyService';
import { ApiResponse } from '@realestate/response';
import { IPropertyFilter, IPaginationQuery } from '@realestate/types';

export class PropertyController {
  private propertyService: PropertyService;

  constructor() {
    this.propertyService = new PropertyService();
  }

  createProperty = async (req: Request, res: Response): Promise<void> => {
    const property = await this.propertyService.createProperty({
      ...req.body,
      brokerId: req.user!.sub,
    });
    ApiResponse.created(res, property, 'Property created successfully and pending review');
  };

  getProperty = async (req: Request, res: Response): Promise<void> => {
    const property = await this.propertyService.getPropertyById(
      req.params.id,
      req.user?.sub,
    );
    ApiResponse.success(res, property);
  };

  searchProperties = async (req: Request, res: Response): Promise<void> => {
    const filter: IPropertyFilter = {
      type: req.query.type as IPropertyFilter['type'],
      listingType: req.query.listingType as IPropertyFilter['listingType'],
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minArea: req.query.minArea ? Number(req.query.minArea) : undefined,
      maxArea: req.query.maxArea ? Number(req.query.maxArea) : undefined,
      bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
      bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
      furnished: req.query.furnished as IPropertyFilter['furnished'],
      city: req.query.city as string,
      district: req.query.district as string,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lng: req.query.lng ? Number(req.query.lng) : undefined,
      radius: req.query.radius ? Number(req.query.radius) : undefined,
      isFeatured: req.query.featured === 'true' ? true : undefined,
      search: req.query.q as string,
      sortBy: req.query.sortBy as IPropertyFilter['sortBy'],
    };

    const pagination: IPaginationQuery = {
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
    };

    const result = await this.propertyService.searchProperties(
      filter,
      pagination,
      req.user?.sub,
    );

    ApiResponse.paginated(res, result.data, result.meta);
  };

  getAdminProperties = async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as string | undefined;
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const result = await this.propertyService.getAdminProperties(status, page, limit);
    ApiResponse.paginated(res, result.data, result.meta);
  };

  getFeatured = async (req: Request, res: Response): Promise<void> => {
    const properties = await this.propertyService.getFeaturedProperties();
    ApiResponse.success(res, properties);
  };

  updateProperty = async (req: Request, res: Response): Promise<void> => {
    const property = await this.propertyService.updateProperty(
      req.params.id,
      req.user!.sub,
      req.body,
    );
    ApiResponse.success(res, property, 'Property updated successfully');
  };

  deleteProperty = async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.role === 'ADMIN';
    await this.propertyService.deleteProperty(req.params.id, req.user!.sub, isAdmin);
    ApiResponse.noContent(res);
  };

  approveProperty = async (req: Request, res: Response): Promise<void> => {
    await this.propertyService.approveProperty(req.params.id, req.user!.sub);
    ApiResponse.success(res, null, 'Property approved successfully');
  };

  rejectProperty = async (req: Request, res: Response): Promise<void> => {
    await this.propertyService.rejectProperty(
      req.params.id,
      req.user!.sub,
      req.body.reason,
    );
    ApiResponse.success(res, null, 'Property rejected');
  };

  getBrokerProperties = async (req: Request, res: Response): Promise<void> => {
    const properties = await this.propertyService.getBrokerProperties(
      req.user!.sub,
      req.query.status as PropertyStatus | undefined,
    );
    ApiResponse.success(res, properties);
  };

  toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    const result = await this.propertyService.toggleFavorite(
      req.user!.sub,
      req.params.id,
    );
    ApiResponse.success(res, result);
  };

  getFavorites = async (req: Request, res: Response): Promise<void> => {
    const result = await this.propertyService.getUserFavorites(req.user!.sub, {
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
    });
    ApiResponse.paginated(res, result.data, result.meta);
  };
}

type PropertyStatus = import('@realestate/types').PropertyStatus;
