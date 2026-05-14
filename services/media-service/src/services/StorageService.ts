import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { generateUuid } from '@realestate/utils';
import { createLogger } from '@realestate/utils';

const logger = createLogger('StorageService');

export interface UploadResult {
  key: string;
  url: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadImage(
    buffer: Buffer,
    originalName: string,
    folder: string,
    generateThumbnail = true,
  ): Promise<UploadResult> {
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `${folder}/${generateUuid()}.webp`;

    // Convert to WebP and optimize
    const optimized = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();

    const metadata = await sharp(buffer).metadata();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: optimized,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      }),
    );

    const result: UploadResult = {
      key,
      url: `${this.publicUrl}/${key}`,
      sizeBytes: optimized.length,
      width: metadata.width,
      height: metadata.height,
    };

    if (generateThumbnail) {
      const thumbKey = `${folder}/thumb_${generateUuid()}.webp`;
      const thumbnail = await sharp(buffer)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbKey,
          Body: thumbnail,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000',
        }),
      );

      result.thumbnailKey = thumbKey;
      result.thumbnailUrl = `${this.publicUrl}/${thumbKey}`;
    }

    logger.info(`Image uploaded: ${key}`);
    return result;
  }

  async uploadVideo(buffer: Buffer, originalName: string, folder: string): Promise<UploadResult> {
    const ext = originalName.split('.').pop()?.toLowerCase() || 'mp4';
    const key = `${folder}/${generateUuid()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: `video/${ext}`,
        CacheControl: 'public, max-age=31536000',
      }),
    );

    logger.info(`Video uploaded: ${key}`);

    return {
      key,
      url: `${this.publicUrl}/${key}`,
      sizeBytes: buffer.length,
    };
  }

  async uploadAvatar(buffer: Buffer, userId: string): Promise<UploadResult> {
    const key = `avatars/${userId}.webp`;

    const optimized = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: optimized,
        ContentType: 'image/webp',
      }),
    );

    return {
      key,
      url: `${this.publicUrl}/${key}`,
      sizeBytes: optimized.length,
      width: 200,
      height: 200,
    };
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    logger.info(`File deleted: ${key}`);
  }
}
