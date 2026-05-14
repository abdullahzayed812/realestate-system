import './env'; // must be first — loads .env before any DB modules
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DatabaseConnection, RedisConnection } from '@realestate/database';
import { errorHandler, requestLogger } from '@realestate/middlewares';
import jwt from 'jsonwebtoken';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { config } from './config';
import { createLogger } from '@realestate/utils';

const logger = createLogger('AuthService');

async function bootstrap(): Promise<void> {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(express.urlencoded({ extended: true }));

  // Connect to Redis
  const redis = RedisConnection.getInstance();
  await redis.connect();
  logger.info('Redis connected');

  // Health check
  app.get('/health', async (_req, res) => {
    const db = DatabaseConnection.getInstance();
    const [dbOk, redisOk] = await Promise.all([
      db.healthCheck(),
      redis.healthCheck(),
    ]);

    res.json({
      status: dbOk && redisOk ? 'healthy' : 'degraded',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      checks: { database: dbOk, redis: redisOk },
    });
  });

  // Dev-only: issue a real signed JWT for the admin dashboard dev login
  if (config.env !== 'production') {
    app.post('/api/auth/dev-login', (_req, res) => {
      const accessToken = jwt.sign(
        { sub: 'usr-admin-001', role: 'ADMIN', phone: '+201000000001' },
        config.jwt.accessSecret,
        { expiresIn: '7d' },
      );
      const refreshToken = jwt.sign(
        { sub: 'usr-admin-001' },
        config.jwt.refreshSecret,
        { expiresIn: '30d' },
      );
      res.json({ success: true, data: { accessToken, refreshToken } });
    });
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  app.listen(config.port, () => {
    logger.info(`Auth Service running on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Auth Service:', err);
  process.exit(1);
});
