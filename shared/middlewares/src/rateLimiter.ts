import { Request, Response, NextFunction } from 'express';
import { RedisConnection } from '@realestate/database';
import { TooManyRequestsError } from '@realestate/errors';

interface RateLimiterOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimiter(options: RateLimiterOptions) {
  const { windowSeconds, maxRequests, keyPrefix = 'rl' } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.user?.sub || req.ip || 'anonymous';
    const key = `${keyPrefix}:${identifier}:${req.path}`;

    const redis = RedisConnection.getInstance();

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (current > maxRequests) {
      throw new TooManyRequestsError(
        `Rate limit exceeded. Max ${maxRequests} requests per ${windowSeconds} seconds.`,
      );
    }

    next();
  };
}

export const defaultRateLimiter = rateLimiter({ windowSeconds: 60, maxRequests: 100 });
export const authRateLimiter = rateLimiter({ windowSeconds: 60, maxRequests: 10, keyPrefix: 'auth' });
export const uploadRateLimiter = rateLimiter({ windowSeconds: 60, maxRequests: 20, keyPrefix: 'upload' });
