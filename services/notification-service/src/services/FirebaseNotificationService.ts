import { createLogger } from '@realestate/utils';
import { DatabaseConnection } from '@realestate/database';
import { generateUuid } from '@realestate/utils';
import { NotificationType } from '@realestate/types';
import { RowDataPacket } from 'mysql2';

const logger = createLogger('NotificationService');

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  data?: Record<string, unknown>;
}

export class FirebaseNotificationService {
  private db: DatabaseConnection;
  private firebaseAdminApp: import('firebase-admin/app').App | null = null;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.initFirebase();
  }

  private initFirebase(): void {
    try {
      const admin = require('firebase-admin');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

      if (serviceAccount.project_id) {
        this.firebaseAdminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        logger.info('Firebase Admin initialized');
      } else {
        logger.warn('Firebase credentials not configured - push notifications disabled');
      }
    } catch (err) {
      logger.error('Firebase Admin initialization failed', err);
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    // Save to database
    await this.saveNotification(payload);

    // Get user's FCM token
    const fcmToken = await this.getUserFcmToken(payload.userId);
    if (!fcmToken) {
      logger.info(`No FCM token for user ${payload.userId}`);
      return;
    }

    // Send push notification
    await this.sendPushNotification(fcmToken, payload);
  }

  async sendBulkNotification(payloads: NotificationPayload[]): Promise<void> {
    await Promise.all(payloads.map((p) => this.sendNotification(p)));
  }

  private async saveNotification(payload: NotificationPayload): Promise<void> {
    await this.db.executeModify(
      `INSERT INTO notifications (id, user_id, type, title, title_ar, body, body_ar, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUuid(),
        payload.userId,
        payload.type,
        payload.title,
        payload.titleAr,
        payload.body,
        payload.bodyAr,
        payload.data ? JSON.stringify(payload.data) : null,
      ],
    );
  }

  private async getUserFcmToken(userId: string): Promise<string | null> {
    const { rows } = await this.db.execute<RowDataPacket>(
      'SELECT fcm_token FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId],
    );
    return rows[0]?.fcm_token || null;
  }

  private async sendPushNotification(
    fcmToken: string,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!this.firebaseAdminApp) return;

    try {
      const admin = require('firebase-admin');
      const messaging = admin.messaging(this.firebaseAdminApp);

      await messaging.send({
        token: fcmToken,
        notification: {
          title: payload.titleAr,
          body: payload.bodyAr,
        },
        data: {
          type: payload.type,
          ...(payload.data ? Object.fromEntries(
            Object.entries(payload.data).map(([k, v]) => [k, String(v)]),
          ) : {}),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'realestate_default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });

      logger.info(`Push notification sent to user ${payload.userId}`);
    } catch (err) {
      logger.error(`Failed to send push notification to user ${payload.userId}`, err);
    }
  }

  async getUserNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: unknown[]; unreadCount: number; total: number }> {
    const offset = (page - 1) * limit;

    const [notifs, countResult, unreadResult] = await Promise.all([
      this.db.execute<RowDataPacket>(
        `SELECT id, user_id AS userId, type, title, title_ar AS titleAr,
                body, body_ar AS bodyAr, data, is_read AS isRead,
                read_at AS readAt, created_at AS createdAt
         FROM notifications WHERE user_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset],
      ),
      this.db.execute<RowDataPacket>(
        'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
        [userId],
      ),
      this.db.execute<RowDataPacket>(
        'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId],
      ),
    ]);

    return {
      data: notifs.rows,
      total: countResult.rows[0]?.total || 0,
      unreadCount: unreadResult.rows[0]?.count || 0,
    };
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.executeModify(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId],
    );
  }
}
