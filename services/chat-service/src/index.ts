import 'express-async-errors';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';
import { DatabaseConnection, RedisConnection } from '@realestate/database';
import { errorHandler, requestLogger, authenticate, authorize } from '@realestate/middlewares';
import { ChatController } from './controllers/ChatController';
import { ChatGateway } from './gateways/ChatGateway';
import { createLogger } from '@realestate/utils';

dotenv.config();

const logger = createLogger('ChatService');
const PORT = parseInt(process.env.PORT || '3004', 10);

async function bootstrap(): Promise<void> {
  const app = express();
  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
  app.use(express.json());
  app.use(requestLogger);

  const redis = RedisConnection.getInstance();
  await redis.connect();

  // Initialize WebSocket gateway
  new ChatGateway(io);

  // REST API routes
  const chatController = new ChatController();

  app.get('/api/chats', authenticate, chatController.getUserChats);
  app.post('/api/chats', authenticate, authorize('CUSTOMER'), chatController.startChat);
  app.get('/api/chats/:chatId/messages', authenticate, chatController.getChatMessages);

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'chat-service' });
  });

  app.use(errorHandler);

  server.listen(PORT, () => {
    logger.info(`Chat Service running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Chat Service:', err);
  process.exit(1);
});
