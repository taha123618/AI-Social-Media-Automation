import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadParams {
  bucket: string;
  key: string;
  contentType: string;
}

/**
 * Generate a presigned URL for uploading to S3
 */
export async function generatePresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Upload a file buffer directly to S3
 */
export async function uploadToS3(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string,
  bucket: string = process.env.AWS_BUCKET_NAME || 'social-media-automation-assets'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

/**
 * Generate S3 key with timestamp and random prefix
 */
export function generateS3Key(folder: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  const baseName = filename.split('.').slice(0, -1).join('.');

  return `${folder}/${timestamp}-${randomString}-${baseName}.${extension}`;
}

/**
 * Validate file type for image uploads
 */
export function isValidImageType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size (max 10MB for images)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}
