import { UserRole } from './user.types';

export interface IJwtPayload {
  sub: string;
  role: UserRole;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IOtpRequest {
  phone: string;
  purpose: OtpPurpose;
}

export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'PHONE_VERIFY';

export interface IRegisterDto {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  role?: 'CUSTOMER' | 'BROKER';
  otpCode: string;
}

export interface ILoginDto {
  phone: string;
  otpCode: string;
}

export interface IRefreshTokenDto {
  refreshToken: string;
}
