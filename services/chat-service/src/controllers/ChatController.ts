import { Request, Response } from 'express';
import { ChatRepository } from '../repositories/ChatRepository';
import { ApiResponse } from '@realestate/response';
import { buildPaginationMeta } from '@realestate/utils';

export class ChatController {
  private chatRepo: ChatRepository;

  constructor() {
    this.chatRepo = new ChatRepository();
  }

  getUserChats = async (req: Request, res: Response): Promise<void> => {
    const role = req.user!.role as 'CUSTOMER' | 'BROKER';
    const chats = await this.chatRepo.findUserChats(req.user!.sub, role);
    ApiResponse.success(res, chats);
  };

  startChat = async (req: Request, res: Response): Promise<void> => {
    const { brokerId, propertyId } = req.body;
    const chat = await this.chatRepo.findOrCreateChat(
      req.user!.sub,
      brokerId,
      propertyId,
    );
    ApiResponse.success(res, chat);
  };

  getChatMessages = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 30);

    const { data, total } = await this.chatRepo.getChatMessages(chatId, page, limit);
    ApiResponse.paginated(res, data, buildPaginationMeta(total, page, limit));
  };
}
