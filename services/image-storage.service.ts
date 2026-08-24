import prisma from '@/lib/prisma';
import type { InputJsonValue } from '@prisma/client/runtime/client';
import { uploadToS3, generateS3Key } from '@/lib/s3';
import axios from 'axios';
import path from 'path';
import { ImageStorageStatus } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

const MAX_DB_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB limit for database binary storage

export interface ImageStorage {
  id: string;
  businessId: string | null;
  userId: string | null;
  originalName: string;
  fileName: string;
  fileSize: bigint;
  mimeType: string;
  url: string;
  isPublic: boolean;
  tags: string[];
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export class ImageStorageService {
  /**
   * Store image metadata in database
   */
  static async storeImage(imageData: {
    businessId?: string;
    userId?: string;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    isPublic?: boolean;
    tags?: string[];
    metadata?: unknown;
    status?: ImageStorageStatus;
    data?: Buffer;
    errorMessage?: string;
  }): Promise<ImageStorage> {
    try {
      const image = await prisma.imageStorage.create({
        data: {
          businessId: imageData.businessId,
          userId: imageData.userId,
          originalName: imageData.originalName,
          fileName: imageData.fileName,
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType,
          url: imageData.url,
          isPublic: imageData.isPublic || false,
          tags: imageData.tags || [],
          metadata: imageData.metadata || {},
          status: imageData.status || ImageStorageStatus.PENDING,
          data: imageData.data as any || null,
          errorMessage: imageData.errorMessage || null,
        },
      });

      console.log(`[ImageStorage] Stored image: ${image.id} for ${imageData.businessId || imageData.userId}`);

      await SystemLogger.logActivity({
        action: "IMAGE_STORED",
        entity: "ImageStorage",
        entityId: image.id,
        details: { businessId: imageData.businessId, fileName: imageData.fileName }
      });

      return image;
    } catch (error: any) {
      console.error('[ImageStorage] Failed to store image:', error);
      await SystemLogger.logError({
        message: error.message || "Failed to store image metadata",
        source: "ImageStorageService.storeImage",
        context: { businessId: imageData.businessId, fileName: imageData.fileName }
      });
      throw new Error('Failed to store image metadata');
    }
  }

  /**
   * Get images for a user or business
   */
  static async getImages(options: {
    businessId?: string;
    userId?: string;
    isPublic?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'fileSize' | 'originalName';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ images: ImageStorage[]; total: number }> {
    try {
      const where: Record<string, unknown> = {};

      if (options.businessId) where.businessId = options.businessId;
      if (options.userId) where.userId = options.userId;
      if (options.isPublic !== undefined) where.isPublic = options.isPublic;
      if (options.tags && options.tags.length > 0) {
        where.tags = {
          hasSome: options.tags
        };
      }

      const [images, total] = await Promise.all([
        prisma.imageStorage.findMany({
          where,
          orderBy: {
            [options.sortBy || 'createdAt']: options.sortOrder || 'desc'
          },
          take: options.limit || 50,
          skip: options.offset || 0,
        }),
        prisma.imageStorage.count({ where })
      ]);

      return { images, total };
    } catch (error) {
      console.error('[ImageStorage] Failed to get images:', error);
      throw new Error('Failed to retrieve images');
    }
  }

  /**
   * Get single image by ID
   */
  static async getImage(imageId: string): Promise<ImageStorage | null> {
    try {
      const image = await prisma.imageStorage.findUnique({
        where: { id: imageId }
      });
      return image;
    } catch (error) {
      console.error('[ImageStorage] Failed to get image:', error);
      throw new Error('Failed to retrieve image');
    }
  }

  /**
   * Delete image from storage and database
   */
  static async deleteImage(imageId: string, businessId?: string, userId?: string): Promise<boolean> {
    try {
      const where: Record<string, unknown> = { id: imageId };
      if (businessId) where.businessId = businessId;
      if (userId) where.userId = userId;

      const image = await prisma.imageStorage.findFirst({ where });
      if (!image) {
        throw new Error('Image not found or access denied');
      }

      // Delete from database
      await prisma.imageStorage.delete({ where: { id: imageId } });

      // TODO: Delete from file storage (S3, local disk, etc.)
      // This would depend on your storage implementation

      console.log(`[ImageStorage] Deleted image: ${imageId}`);

      await SystemLogger.logAudit({
        action: "IMAGE_DELETED",
        resource: `ImageStorage:${imageId}`,
        userId: userId || "system", // Should ideally pass current user
        status: "SUCCESS",
        details: { businessId }
      });

      return true;
    } catch (error: any) {
      console.error('[ImageStorage] Failed to delete image:', error);
      await SystemLogger.logError({
        message: error.message || "Failed to delete image",
        source: "ImageStorageService.deleteImage",
        context: { imageId, businessId }
      });
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Update image metadata
   */
  static async updateImage(
    imageId: string,
    updates: {
      tags?: string[];
      isPublic?: boolean;
      metadata?: InputJsonValue;
    },
    businessId?: string,
    userId?: string
  ): Promise<ImageStorage> {
    try {
      const where: Record<string, unknown> = { id: imageId };
      if (businessId) where.businessId = businessId;
      if (userId) where.userId = userId;

      const image = await prisma.imageStorage.findFirst({ where });
      if (!image) {
        throw new Error('Image not found or access denied');
      }

      const updatedImage = await prisma.imageStorage.update({
        where: { id: imageId },
        data: updates
      });

      console.log(`[ImageStorage] Updated image: ${imageId}`);
      return updatedImage;
    } catch (error) {
      console.error('[ImageStorage] Failed to update image:', error);
      throw new Error('Failed to update image');
    }
  }

  /**
   * Search images by tags or metadata
   */
  static async searchImages(query: {
    businessId?: string;
    userId?: string;
    searchTerm?: string;
    tags?: string[];
    mimeType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ images: ImageStorage[]; total: number }> {
    try {
      const where: Record<string, unknown> = {};

      if (query.businessId) where.businessId = query.businessId;
      if (query.userId) where.userId = query.userId;
      if (query.mimeType) where.mimeType = query.mimeType;

      if (query.searchTerm) {
        where.OR = [
          { originalName: { contains: query.searchTerm, mode: 'insensitive' } },
          { fileName: { contains: query.searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [query.searchTerm] } }
        ];
      }

      if (query.tags && query.tags.length > 0) {
        where.tags = { hasSome: query.tags };
      }

      const [images, total] = await Promise.all([
        prisma.imageStorage.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: query.limit || 50,
          skip: query.offset || 0,
        }),
        prisma.imageStorage.count({ where })
      ]);

      return { images, total };
    } catch (error) {
      console.error('[ImageStorage] Failed to search images:', error);
      throw new Error('Failed to search images');
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(businessId?: string, userId?: string): Promise<{
    totalImages: number;
    totalSize: number;
    usedStorage: number;
    averageFileSize: number;
    fileTypeBreakdown: Record<string, number>;
  }> {
    try {
      const where: Record<string, unknown> = {};
      if (businessId) where.businessId = businessId;
      if (userId) where.userId = userId;

      const [totalImages, totalSizeResult, fileTypeBreakdown] = await Promise.all([
        prisma.imageStorage.count({ where }),
        prisma.imageStorage.aggregate({
          where,
          _sum: { fileSize: true }
        }),
        prisma.imageStorage.groupBy({
          by: ['mimeType'],
          where,
          _count: { mimeType: true }
        })
      ]);

      const totalSize = Number(totalSizeResult._sum.fileSize || BigInt(0));
      const averageFileSize = totalImages > 0 ? Math.round(totalSize / totalImages) : 0;

      const breakdown: Record<string, number> = {};
      fileTypeBreakdown.forEach((item: { mimeType: string; _count: { mimeType: number } }) => {
        breakdown[item.mimeType] = item._count.mimeType;
      });

      return {
        totalImages,
        totalSize,
        usedStorage: totalSize,
        averageFileSize,
        fileTypeBreakdown: breakdown
      };
    } catch (error) {
      console.error('[ImageStorage] Failed to get storage stats:', error);
      throw new Error('Failed to get storage statistics');
    }
  }

  /**
   * Ingest an image from a URL, upload to S3, and store in database
   */
  static async ingestImageFromUrl(
    url: string,
    options: {
      businessId?: string;
      userId?: string;
      folder?: string;
      tags?: string[];
      metadata?: unknown;
    } = {}
  ): Promise<ImageStorage> {
    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new Error('Valid image URL is required');
    }

    try {
      const bucketName = process.env.AWS_BUCKET_NAME || 'social-media-automation-assets';
      const s3Domain = `${bucketName}.s3.amazonaws.com`;

      // 1. Check if it's already in our S3 bucket
      if (url.includes(s3Domain)) {
        console.log(`[ImageStorage] URL already in S3: ${url}, checking if metadata exists`);
        const existing = await prisma.imageStorage.findFirst({
          where: { url }
        });

        if (existing) {
          return existing;
        }
      }

      await SystemLogger.logActivity({
        action: "IMAGE_INGESTION_STARTED",
        entity: "ImageStorage",
        details: { url, businessId: options.businessId }
      });

      // 2. Download the image
      console.log(`[ImageStorage] Ingesting image from URL: ${url}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const mimeType = String(response.headers['content-type'] || 'image/jpeg');
      const fileSize = buffer.length;

      // Extract filename from URL or use a default
      let originalName = 'downloaded_image';
      try {
        const urlPath = new URL(url).pathname;
        originalName = path.basename(urlPath) || originalName;
      } catch (e) { }

      const fileName = generateS3Key(options.folder || 'ingested', originalName);

      let s3Url: string | null = null;
      let status: ImageStorageStatus = ImageStorageStatus.UPLOADED;
      let errorMessage: string | null = null;
      let binaryData: Buffer | null = null;

      try {
        s3Url = await uploadToS3(buffer, fileName, mimeType);
      } catch (s3Error) {
        console.warn(`[ImageStorage] S3 upload failed for ${url}, falling back to DB if possible:`, s3Error);

        if (buffer.length <= MAX_DB_STORAGE_SIZE) {
          status = ImageStorageStatus.FAILED;
          binaryData = buffer;
          errorMessage = s3Error instanceof Error ? s3Error.message : 'S3 upload failed';
          // Construct a temporary URL or just use a placeholder
          s3Url = `pending://${fileName}`;
        } else {
          throw new Error(`S3 upload failed and file too large for DB fallback (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
        }
      }

      // 4. Store in database
      const image = await this.storeImage({
        businessId: options.businessId,
        userId: options.userId,
        originalName,
        fileName,
        fileSize,
        mimeType,
        url: s3Url!,
        tags: options.tags,
        metadata: options.metadata,
        status,
        data: binaryData || undefined,
        errorMessage: errorMessage || undefined
      });

      await SystemLogger.logActivity({
        action: "IMAGE_INGESTION_COMPLETED",
        entity: "ImageStorage",
        entityId: image.id,
        details: { businessId: options.businessId, status }
      });

      return image;
    } catch (error: any) {
      console.error('[ImageStorage] Failed to ingest image from URL:', error);
      await SystemLogger.logError({
        message: error.message || "Image ingestion from URL failed",
        source: "ImageStorageService.ingestImageFromUrl",
        context: { url, businessId: options.businessId }
      });
      throw new Error('Failed to ingest image from URL');
    }
  }

  /**
   * Ingest an image from a buffer
   */
  static async ingestImageFromBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: {
      businessId?: string;
      userId?: string;
      folder?: string;
      tags?: string[];
      metadata?: unknown;
    } = {}
  ): Promise<ImageStorage> {
    try {
      const fileName = generateS3Key(options.folder || 'uploads', originalName);
      const fileSize = buffer.length;

      let s3Url: string | null = null;
      let status: ImageStorageStatus = ImageStorageStatus.UPLOADED;
      let errorMessage: string | null = null;
      let binaryData: Buffer | null = null;

      try {
        s3Url = await uploadToS3(buffer, fileName, mimeType);
      } catch (s3Error) {
        console.warn(`[ImageStorage] S3 upload failed for ${originalName}, falling back to DB if possible:`, s3Error);

        if (fileSize <= MAX_DB_STORAGE_SIZE) {
          status = ImageStorageStatus.FAILED;
          binaryData = buffer;
          errorMessage = s3Error instanceof Error ? s3Error.message : 'S3 upload failed';
          s3Url = `pending://${fileName}`;
        } else {
          throw new Error(`S3 upload failed and file too large for DB fallback (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      }

      return await this.storeImage({
        businessId: options.businessId,
        userId: options.userId,
        originalName,
        fileName,
        fileSize,
        mimeType,
        url: s3Url!,
        tags: options.tags,
        metadata: options.metadata,
        status,
        data: binaryData || undefined,
        errorMessage: errorMessage || undefined
      });
    } catch (error) {
      console.error('[ImageStorage] Failed to ingest image from buffer:', error);
      throw new Error('Failed to ingest image from buffer');
    }
  }
  /**
   * Retry failed uploads that have binary data stored in the DB
   */
  static async retryFailedUploads(): Promise<{ success: number; failed: number }> {
    const failedRecords = await prisma.imageStorage.findMany({
      where: {
        status: ImageStorageStatus.FAILED,
        data: { not: null }
      },
      take: 20 // Process in small batches
    });

    if (failedRecords.length === 0) return { success: 0, failed: 0 };

    console.log(`[ImageStorage] Retrying ${failedRecords.length} failed S3 uploads...`);
    let success = 0;
    let failed = 0;

    for (const record of failedRecords) {
      try {
        const s3Url = await uploadToS3(record.data as Buffer, record.fileName, record.mimeType);

        await prisma.imageStorage.update({
          where: { id: record.id },
          data: {
            url: s3Url,
            status: ImageStorageStatus.UPLOADED,
            data: null,
            errorMessage: null
          }
        });

        success++;
      } catch (error) {
        console.error(`[ImageStorage] Retry failed for record ${record.id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Clean up binary data for failed uploads older than 48 hours
   */
  static async cleanupExpiredBinaries(): Promise<number> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() - 48);

    const result = await prisma.imageStorage.updateMany({
      where: {
        status: ImageStorageStatus.FAILED,
        data: { not: null },
        createdAt: { lt: expiryDate }
      },
      data: {
        data: null,
        errorMessage: 'Binary data expired after 48 hours'
      }
    });

    if (result.count > 0) {
      console.log(`[ImageStorage] Cleaned up ${result.count} expired binaries`);
    }

    return result.count;
  }


}
