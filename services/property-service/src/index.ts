import './env';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DatabaseConnection, RedisConnection } from '@realestate/database';
import { errorHandler, requestLogger } from '@realestate/middlewares';
import { createLogger } from '@realestate/utils';
import { propertyRoutes } from './routes/property.routes';
import { brokerRoutes } from './routes/broker.routes';
import { analyticsRoutes } from './routes/analytics.routes';

const logger = createLogger('PropertyService');
const PORT = parseInt(process.env.PORT || '3002', 10);

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  const redis = RedisConnection.getInstance();
  await redis.connect();

  app.get('/health', async (_req, res) => {
    const db = DatabaseConnection.getInstance();
    const [dbOk, redisOk] = await Promise.all([db.healthCheck(), redis.healthCheck()]);
    res.json({
      status: dbOk && redisOk ? 'healthy' : 'degraded',
      service: 'property-service',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/properties', propertyRoutes);
  app.use('/api/brokers', brokerRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
  app.use(errorHandler);

  app.listen(PORT, () => logger.info(`Property Service running on port ${PORT}`));
}

bootstrap().catch((err) => {
  logger.error('Failed to start Property Service', err);
  process.exit(1);
});
