export type PropertyType =
  | 'APARTMENT' | 'VILLA' | 'LAND' | 'OFFICE'
  | 'SHOP' | 'WAREHOUSE' | 'FACTORY'
  | 'COMMERCIAL_BUILDING' | 'CHALET' | 'DUPLEX'
  | 'PENTHOUSE' | 'STUDIO' | 'TOWNHOUSE';

export type ListingType = 'SALE' | 'RENT' | 'DAILY_RENT';

export type PropertyStatus =
  | 'DRAFT' | 'PENDING' | 'ACTIVE'
  | 'SOLD' | 'RENTED' | 'SUSPENDED' | 'REJECTED';

export type FurnishedStatus = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';

export type PropertyCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'NEEDS_RENOVATION';

export type FeatureCategory = 'INDOOR' | 'OUTDOOR' | 'SECURITY' | 'UTILITIES' | 'NEARBY';

export type Currency = 'EGP' | 'USD' | 'EUR';

export type PricePer = 'TOTAL' | 'METER' | 'NIGHT' | 'MONTH' | 'YEAR';

export interface IPropertyLocation {
  id: string;
  propertyId: string;
  latitude: number;
  longitude: number;
  address: string;
  addressAr: string | null;
  city: string;
  district: string | null;
  neighborhood: string | null;
  postalCode: string | null;
  country: string;
  googlePlaceId: string | null;
}

export interface IPropertyImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface IPropertyVideo {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  sizeBytes: number | null;
  sortOrder: number;
  createdAt: Date;
}

export interface IPropertyFeature {
  id: string;
  propertyId: string;
  feature: string;
  featureAr: string | null;
  category: FeatureCategory;
}

export interface IProperty {
  id: string;
  brokerId: string;
  companyId: string | null;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  pricePer: PricePer;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  parkingSpaces: number;
  furnished: FurnishedStatus | null;
  condition: PropertyCondition | null;
  yearBuilt: number | null;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyFull extends IProperty {
  location: IPropertyLocation;
  images: IPropertyImage[];
  videos: IPropertyVideo[];
  features: IPropertyFeature[];
  broker?: {
    id: string;
    userId: string;
    rating: number;
    isVerified: boolean;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
      avatarUrl: string | null;
    };
  };
}

export interface IPropertyFilter {
  type?: PropertyType | PropertyType[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: FurnishedStatus;
  city?: string;
  district?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  isFeatured?: boolean;
  brokerId?: string;
  companyId?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area_asc' | 'area_desc';
}
