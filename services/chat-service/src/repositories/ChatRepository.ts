import { RowDataPacket } from 'mysql2';
import { DatabaseConnection } from '@realestate/database';
import { IChat, IMessage, IChatWithLastMessage, MessageType } from '@realestate/types';
import { generateUuid } from '@realestate/utils';

interface ChatRow extends IChat, RowDataPacket {}
interface MessageRow extends IMessage, RowDataPacket {}

export class ChatRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findOrCreateChat(
    customerId: string,
    brokerId: string,
    propertyId?: string,
  ): Promise<IChat> {
    const { rows } = await this.db.execute<ChatRow>(
      `SELECT id, customer_id AS customerId, broker_id AS brokerId,
              property_id AS propertyId, customer_unread AS customerUnread,
              broker_unread AS brokerUnread, is_archived AS isArchived,
              created_at AS createdAt, updated_at AS updatedAt
       FROM chats
       WHERE customer_id = ? AND broker_id = ? AND property_id <=> ?`,
      [customerId, brokerId, propertyId || null],
    );

    if (rows[0]) return rows[0];

    const id = generateUuid();
    await this.db.executeModify(
      'INSERT INTO chats (id, customer_id, broker_id, property_id) VALUES (?, ?, ?, ?)',
      [id, customerId, brokerId, propertyId || null],
    );

    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<IChat | null> {
    const { rows } = await this.db.execute<ChatRow>(
      `SELECT id, customer_id AS customerId, broker_id AS brokerId,
              property_id AS propertyId, customer_unread AS customerUnread,
              broker_unread AS brokerUnread, is_archived AS isArchived,
              created_at AS createdAt, updated_at AS updatedAt
       FROM chats WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async findUserChats(userId: string, role: 'CUSTOMER' | 'BROKER'): Promise<IChatWithLastMessage[]> {
    const userField = role === 'CUSTOMER' ? 'c.customer_id' : 'c.broker_id';
    const otherField = role === 'CUSTOMER'
      ? 'c.broker_id'
      : 'c.customer_id';

    const { rows } = await this.db.execute<RowDataPacket>(
      `SELECT c.id, c.customer_id AS customerId, c.broker_id AS brokerId,
              c.property_id AS propertyId, c.customer_unread AS customerUnread,
              c.broker_unread AS brokerUnread, c.is_archived AS isArchived,
              c.created_at AS createdAt, c.updated_at AS updatedAt,
              m.id AS msgId, m.content AS msgContent, m.type AS msgType,
              m.created_at AS msgCreatedAt, m.is_read AS msgIsRead,
              u.id AS otherUserId, u.first_name AS otherFirstName,
              u.last_name AS otherLastName, u.avatar_url AS otherAvatarUrl,
              p.title_ar AS propertyTitleAr
       FROM chats c
       LEFT JOIN messages m ON c.last_message_id = m.id
       JOIN users u ON u.id = ${otherField}
       LEFT JOIN properties p ON p.id = c.property_id
       WHERE ${userField} = ? AND c.is_archived = FALSE
       ORDER BY c.updated_at DESC`,
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      customerId: row.customerId,
      brokerId: row.brokerId,
      propertyId: row.propertyId,
      propertyTitleAr: row.propertyTitleAr || null,
      customerUnread: row.customerUnread,
      brokerUnread: row.brokerUnread,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastMessage: row.msgId ? {
        id: row.msgId,
        content: row.msgContent,
        type: row.msgType,
        createdAt: row.msgCreatedAt,
        isRead: row.msgIsRead,
      } : null,
      otherUser: {
        id: row.otherUserId,
        firstName: row.otherFirstName,
        lastName: row.otherLastName,
        avatarUrl: row.otherAvatarUrl,
      },
    })) as IChatWithLastMessage[];
  }

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    type: MessageType;
    content?: string;
    mediaUrl?: string;
    mediaDuration?: number;
    propertyId?: string;
  }): Promise<IMessage> {
    const id = generateUuid();

    await this.db.transaction(async (conn) => {
      await conn.execute(
        `INSERT INTO messages (id, chat_id, sender_id, type, content, media_url, media_duration, property_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, data.chatId, data.senderId, data.type,
          data.content || null, data.mediaUrl || null,
          data.mediaDuration || null, data.propertyId || null,
        ],
      );

      // Update chat: set last message and increment unread for recipient
      const [chatRows] = await conn.execute<ChatRow[]>(
        'SELECT customer_id AS customerId, broker_id AS brokerId FROM chats WHERE id = ?',
        [data.chatId],
      );

      const chat = chatRows[0];
      const isFromCustomer = chat.customerId === data.senderId;
      const unreadField = isFromCustomer ? 'broker_unread' : 'customer_unread';

      await conn.execute(
        `UPDATE chats SET last_message_id = ?, ${unreadField} = ${unreadField} + 1, updated_at = NOW()
         WHERE id = ?`,
        [id, data.chatId],
      );
    });

    return (await this.findMessageById(id))!;
  }

  async findMessageById(id: string): Promise<IMessage | null> {
    const { rows } = await this.db.execute<MessageRow>(
      `SELECT id, chat_id AS chatId, sender_id AS senderId, type,
              content, media_url AS mediaUrl, media_duration AS mediaDuration,
              property_id AS propertyId, is_read AS isRead, read_at AS readAt,
              deleted_at AS deletedAt, created_at AS createdAt
       FROM messages WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async getChatMessages(
    chatId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IMessage[]; total: number }> {
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      this.db.query<RowDataPacket>(
        'SELECT COUNT(*) AS total FROM messages WHERE chat_id = ? AND deleted_at IS NULL',
        [chatId],
      ),
      this.db.query<MessageRow>(
        `SELECT id, chat_id AS chatId, sender_id AS senderId, type,
                content, media_url AS mediaUrl, media_duration AS mediaDuration,
                property_id AS propertyId, is_read AS isRead, read_at AS readAt,
                created_at AS createdAt
         FROM messages WHERE chat_id = ? AND deleted_at IS NULL
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [chatId, limit, offset],
      ),
    ]);

    return {
      data: dataResult.rows,
      total: countResult.rows[0]?.total || 0,
    };
  }

  async markMessagesRead(chatId: string, userId: string): Promise<void> {
    await this.db.executeModify(
      `UPDATE messages SET is_read = TRUE, read_at = NOW()
       WHERE chat_id = ? AND sender_id != ? AND is_read = FALSE`,
      [chatId, userId],
    );

    // Reset unread count for the reading user
    const { rows: chatRows } = await this.db.execute<ChatRow>(
      'SELECT customer_id AS customerId FROM chats WHERE id = ?',
      [chatId],
    );

    const chat = chatRows[0];
    if (!chat) return;

    const unreadField = chat.customerId === userId ? 'customer_unread' : 'broker_unread';
    await this.db.executeModify(
      `UPDATE chats SET ${unreadField} = 0 WHERE id = ?`,
      [chatId],
    );
  }
}
