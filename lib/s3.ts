import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SecurityService } from './security';

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
  if (!isValidMimeType(contentType)) {
    throw new Error(`Unauthorized file MIME type: ${contentType}`);
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Upload a file buffer directly to S3 with magic byte validation
 */
export async function uploadToS3(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string,
  bucket: string = process.env.AWS_BUCKET_NAME || 'social-media-automation-assets'
): Promise<string> {
  // Validate MIME type allowlist
  if (!isValidMimeType(contentType)) {
    throw new Error(`Unauthorized file MIME type: ${contentType}`);
  }

  // Validate magic bytes to prevent MIME spoofing
  if (!SecurityService.validateMagicBytes(buffer, contentType)) {
    throw new Error(`File signature mismatch: binary does not match declared MIME type ${contentType}`);
  }

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
 * Generate S3 key with sanitized filename, timestamp, and random prefix
 */
export function generateS3Key(folder: string, filename: string): string {
  const sanitizedFilename = SecurityService.sanitizeFilename(filename);
  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 32) || 'uploads';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${cleanFolder}/${timestamp}-${randomString}-${sanitizedFilename}`;
}

/**
 * Validate MIME type against authorized media and document formats
 */
export function isValidMimeType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
    'text/plain',
    'text/csv',
  ];
  return allowedTypes.includes(mimeType?.toLowerCase());
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
  return allowedTypes.includes(mimeType?.toLowerCase());
}

/**
 * Validate file size (max 10MB for images, 50MB for videos)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeBytes;
}
