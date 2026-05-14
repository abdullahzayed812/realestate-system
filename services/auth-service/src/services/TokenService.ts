import jwt from 'jsonwebtoken';
import { IUser, IJwtPayload, IAuthTokens } from '@realestate/types';
import { generateSecureToken } from '@realestate/utils';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { config } from '../config';

export class TokenService {
  private refreshTokenRepo: RefreshTokenRepository;

  constructor() {
    this.refreshTokenRepo = new RefreshTokenRepository();
  }

  generateAccessToken(user: IUser): string {
    const payload: IJwtPayload = {
      sub: user.id,
      role: user.role,
      phone: user.phone,
    };

    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    } as jwt.SignOptions);
  }

  async generateRefreshToken(
    user: IUser,
    deviceInfo?: { deviceId?: string; deviceType?: string; ipAddress?: string },
  ): Promise<string> {
    const token = generateSecureToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.refreshTokenRepo.create(user.id, token, expiresAt, deviceInfo);

    return token;
  }

  async generateAuthTokens(
    user: IUser,
    deviceInfo?: { deviceId?: string; deviceType?: string; ipAddress?: string },
  ): Promise<IAuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user, deviceInfo),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  verifyAccessToken(token: string): IJwtPayload {
    return jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepo.revoke(token);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.revokeAllForUser(userId);
  }
}
