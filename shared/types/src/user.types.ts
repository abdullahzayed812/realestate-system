export type UserRole = 'CUSTOMER' | 'BROKER' | 'COMPANY' | 'ADMIN';
export type PreferredLang = 'ar' | 'en';

export interface IUser {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  preferredLang: PreferredLang;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IBroker {
  id: string;
  userId: string;
  companyId: string | null;
  licenseNumber: string | null;
  bio: string | null;
  bioAr: string | null;
  specializations: string[] | null;
  serviceAreas: string[] | null;
  rating: number;
  totalRatings: number;
  totalProperties: number;
  totalDeals: number;
  isVerified: boolean;
  isFeatured: boolean;
  verifiedAt: Date | null;
  subscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompany {
  id: string;
  ownerId: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  taxNumber: string | null;
  commercialReg: string | null;
  isVerified: boolean;
  isActive: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrokerWithUser extends IBroker {
  user: IUser;
  company: ICompany | null;
}
