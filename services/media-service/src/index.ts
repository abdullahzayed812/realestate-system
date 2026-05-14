import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import dotenv from 'dotenv';
import { authenticate, authorize, errorHandler, uploadRateLimiter, requestLogger } from '@realestate/middlewares';
import { StorageService } from './services/StorageService';
import { ApiResponse } from '@realestate/response';
import { ValidationError } from '@realestate/errors';
import { createLogger } from '@realestate/utils';

dotenv.config();

const logger = createLogger('MediaService');
const PORT = parseInt(process.env.PORT || '3006', 10);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const allowed = [...allowedImages, ...allowedVideos];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

async function bootstrap(): Promise<void> {
  const app = express();
  const storageService = new StorageService();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
  app.use(express.json());
  app.use(requestLogger);

  // Upload property image
  app.post(
    '/api/media/property-image',
    authenticate,
    authorize('BROKER', 'COMPANY'),
    uploadRateLimiter,
    upload.single('image'),
    async (req: Request, res: Response): Promise<void> => {
      if (!req.file) throw new ValidationError('Image file is required');

      const result = await storageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        `properties/${req.body.propertyId || 'temp'}`,
        true,
      );

      ApiResponse.created(res, result, 'Image uploaded successfully');
    },
  );

  // Upload property video
  app.post(
    '/api/media/property-video',
    authenticate,
    authorize('BROKER', 'COMPANY'),
    uploadRateLimiter,
    upload.single('video'),
    async (req: Request, res: Response): Promise<void> => {
      if (!req.file) throw new ValidationError('Video file is required');

      const result = await storageService.uploadVideo(
        req.file.buffer,
        req.file.originalname,
        `properties/${req.body.propertyId || 'temp'}/videos`,
      );

      ApiResponse.created(res, result, 'Video uploaded successfully');
    },
  );

  // Upload avatar
  app.post(
    '/api/media/avatar',
    authenticate,
    upload.single('avatar'),
    async (req: Request, res: Response): Promise<void> => {
      if (!req.file) throw new ValidationError('Avatar file is required');

      const result = await storageService.uploadAvatar(
        req.file.buffer,
        req.user!.sub,
      );

      ApiResponse.created(res, result, 'Avatar uploaded successfully');
    },
  );

  // Upload chat image/voice
  app.post(
    '/api/media/chat',
    authenticate,
    uploadRateLimiter,
    upload.single('file'),
    async (req: Request, res: Response): Promise<void> => {
      if (!req.file) throw new ValidationError('File is required');

      const isImage = req.file.mimetype.startsWith('image/');
      const result = isImage
        ? await storageService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            `chat/${req.user!.sub}`,
            false,
          )
        : await storageService.uploadVideo(
            req.file.buffer,
            req.file.originalname,
            `chat/${req.user!.sub}/voice`,
          );

      ApiResponse.created(res, result);
    },
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'media-service' });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`Media Service running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Media Service:', err);
  process.exit(1);
});
