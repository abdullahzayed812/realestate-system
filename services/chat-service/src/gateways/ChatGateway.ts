import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from '@realestate/types';
import { ChatRepository } from '../repositories/ChatRepository';
import { createLogger } from '@realestate/utils';

const logger = createLogger('ChatGateway');

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
}

export class ChatGateway {
  private io: Server;
  private chatRepo: ChatRepository;
  private userSocketMap = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(io: Server) {
    this.io = io;
    this.chatRepo = new ChatRepository();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET!,
        ) as IJwtPayload;

        (socket as AuthenticatedSocket).userId = payload.sub;
        (socket as AuthenticatedSocket).userRole = payload.role;
        next();
      } catch {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;

      // Track user sockets
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, new Set());
      }
      this.userSocketMap.get(userId)!.add(socket.id);

      logger.info(`User connected: ${userId} (socket: ${socket.id})`);

      // Join personal room
      socket.join(`user:${userId}`);

      socket.on('join_chat', async (data: { chatId: string }) => {
        try {
          if (!data?.chatId || data.chatId === 'undefined' || data.chatId === 'null') {
            socket.emit('error', { message: 'Invalid chat ID' });
            return;
          }

          const chat = await this.chatRepo.findById(data.chatId);

          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          // Verify user is part of this chat
          if (chat.customerId !== userId && chat.brokerId !== userId) {
            socket.emit('error', { message: 'Unauthorized to join this chat' });
            return;
          }

          socket.join(`chat:${data.chatId}`);
          await this.chatRepo.markMessagesRead(data.chatId, userId);
          socket.emit('chat_joined', { chatId: data.chatId });

        } catch (error) {
          logger.error('Error joining chat', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      socket.on('send_message', async (data: {
        chatId: string;
        type: 'TEXT' | 'IMAGE' | 'VOICE' | 'PROPERTY_CARD';
        content?: string;
        mediaUrl?: string;
        mediaDuration?: number;
        propertyId?: string;
      }) => {
        try {
          const chat = await this.chatRepo.findById(data.chatId);

          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          if (chat.customerId !== userId && chat.brokerId !== userId) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          const message = await this.chatRepo.sendMessage({
            chatId: data.chatId,
            senderId: userId,
            type: data.type,
            content: data.content,
            mediaUrl: data.mediaUrl,
            mediaDuration: data.mediaDuration,
            propertyId: data.propertyId,
          });

          // Broadcast to chat room
          this.io.to(`chat:${data.chatId}`).emit('new_message', message);

          // Notify recipient even if not in chat room
          const recipientId = chat.customerId === userId ? chat.brokerId : chat.customerId;
          this.io.to(`user:${recipientId}`).emit('chat_notification', {
            chatId: data.chatId,
            message,
          });

        } catch (error) {
          logger.error('Error sending message', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('typing', (data: { chatId: string }) => {
        socket.to(`chat:${data.chatId}`).emit('user_typing', {
          chatId: data.chatId,
          userId,
        });
      });

      socket.on('stop_typing', (data: { chatId: string }) => {
        socket.to(`chat:${data.chatId}`).emit('user_stop_typing', {
          chatId: data.chatId,
          userId,
        });
      });

      socket.on('mark_read', async (data: { chatId: string }) => {
        try {
          await this.chatRepo.markMessagesRead(data.chatId, userId);
          const chat = await this.chatRepo.findById(data.chatId);
          if (chat) {
            const senderId = chat.customerId === userId ? chat.brokerId : chat.customerId;
            this.io.to(`user:${senderId}`).emit('messages_read', {
              chatId: data.chatId,
              readBy: userId,
            });
          }
        } catch (error) {
          logger.error('Error marking messages read', error);
        }
      });

      socket.on('disconnect', () => {
        const sockets = this.userSocketMap.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSocketMap.delete(userId);
          }
        }
        logger.info(`User disconnected: ${userId}`);
      });
    });
  }

  isUserOnline(userId: string): boolean {
    return (this.userSocketMap.get(userId)?.size ?? 0) > 0;
  }
}
