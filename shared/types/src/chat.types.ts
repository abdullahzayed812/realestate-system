export type MessageType = 'TEXT' | 'IMAGE' | 'VOICE' | 'PROPERTY_CARD' | 'SYSTEM';

export interface IChat {
  id: string;
  customerId: string;
  brokerId: string;
  propertyId: string | null;
  customerUnread: number;
  brokerUnread: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  propertyId: string | null;
  isRead: boolean;
  readAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface IChatWithLastMessage extends IChat {
  lastMessage: IMessage | null;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}
