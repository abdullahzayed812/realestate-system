import { IUser, IAuthTokens, OtpPurpose, IRegisterDto, ILoginDto } from '@realestate/types';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from '@realestate/errors';
import { generateOtp, createLogger } from '@realestate/utils';
import { RedisConnection } from '@realestate/database';
import { UserRepository } from '../repositories/UserRepository';
import { OtpRepository } from '../repositories/OtpRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { TokenService } from './TokenService';
import { SmsService } from './SmsService';
import { config } from '../config';

const logger = createLogger('AuthService');

export class AuthService {
  private userRepo: UserRepository;
  private otpRepo: OtpRepository;
  private refreshTokenRepo: RefreshTokenRepository;
  private tokenService: TokenService;
  private smsService: SmsService;
  private redis: RedisConnection;

  constructor() {
    this.userRepo = new UserRepository();
    this.otpRepo = new OtpRepository();
    this.refreshTokenRepo = new RefreshTokenRepository();
    this.tokenService = new TokenService();
    this.smsService = new SmsService();
    this.redis = RedisConnection.getInstance();
  }

  async sendOtp(phone: string, purpose: OtpPurpose): Promise<void> {
    const rateLimitKey = `otp_rate:${phone}:${purpose}`;
    const attempts = await this.redis.incr(rateLimitKey);

    if (attempts === 1) {
      await this.redis.expire(rateLimitKey, 3600); // 1 hour window
    }

    if (attempts > 5) {
      throw new Error('Too many OTP requests. Please try again in an hour.');
    }

    // For REGISTER purpose, check if user already exists
    if (purpose === 'REGISTER') {
      const existing = await this.userRepo.findByPhone(phone);
      if (existing) {
        throw new ConflictError('Phone number is already registered');
      }
    }

    // For LOGIN purpose, check if user exists
    if (purpose === 'LOGIN') {
      const existing = await this.userRepo.findByPhone(phone);
      if (!existing) {
        throw new NotFoundError('User', phone);
      }
      if (!existing.isActive) {
        throw new ForbiddenError('Your account has been suspended');
      }
    }

    // Invalidate previous OTPs
    await this.otpRepo.invalidatePrevious(phone, purpose);

    const otpCode = generateOtp(6);
    await this.otpRepo.create(phone, otpCode, purpose, config.otp.expiresInMinutes);
    await this.smsService.sendOtp(phone, otpCode);

    logger.info(`OTP sent for ${purpose} to ${phone}`);
  }

  async register(dto: IRegisterDto): Promise<{ user: IUser; tokens: IAuthTokens }> {
    const otp = await this.otpRepo.findLatestValid(dto.phone, 'REGISTER');

    if (!otp) {
      throw new ValidationError('Invalid or expired OTP');
    }

    const attempts = await this.otpRepo.incrementAttempts(otp.id);

    if (attempts > config.otp.maxAttempts) {
      throw new ValidationError('Too many failed OTP attempts');
    }

    if (otp.otpCode !== dto.otpCode) {
      throw new ValidationError('Invalid OTP code');
    }

    await this.otpRepo.markUsed(otp.id);

    // Check if user already exists (race condition guard)
    const existing = await this.userRepo.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictError('Phone number is already registered');
    }

    const user = await this.userRepo.create({
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      role: dto.role || 'CUSTOMER',
    });

    await this.userRepo.updatePhoneVerified(user.id);

    const tokens = await this.tokenService.generateAuthTokens(user);

    logger.info(`New user registered: ${user.id}`);

    return { user, tokens };
  }

  async login(dto: ILoginDto): Promise<{ user: IUser; tokens: IAuthTokens }> {
    const otp = await this.otpRepo.findLatestValid(dto.phone, 'LOGIN');

    if (!otp) {
      throw new ValidationError('Invalid or expired OTP');
    }

    const attempts = await this.otpRepo.incrementAttempts(otp.id);

    if (attempts > config.otp.maxAttempts) {
      throw new ValidationError('Too many failed OTP attempts. Request a new OTP.');
    }

    if (otp.otpCode !== dto.otpCode) {
      throw new ValidationError('Invalid OTP code');
    }

    await this.otpRepo.markUsed(otp.id);

    const user = await this.userRepo.findByPhone(dto.phone);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been suspended. Contact support.');
    }

    await this.userRepo.updateLastLogin(user.id);

    const tokens = await this.tokenService.generateAuthTokens(user);

    logger.info(`User logged in: ${user.id}`);

    return { user, tokens };
  }

  async refreshToken(token: string): Promise<IAuthTokens> {
    const stored = await this.refreshTokenRepo.findByToken(token);

    if (!stored) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(stored.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is no longer active');
    }

    // Rotate refresh token
    await this.refreshTokenRepo.revoke(token);
    const tokens = await this.tokenService.generateAuthTokens(user);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.revoke(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepo.revokeAllForUser(userId);
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }
}
