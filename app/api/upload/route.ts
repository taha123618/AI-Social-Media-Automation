import { NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateS3Key, isValidImageType, isValidFileSize } from '@/lib/s3';
import { ImageStorageService } from '@/services/image-storage.service';

export async function POST(request: Request) {
  try {
    const { filename, contentType, fileSize, folder = 'uploads', businessId, userId } = await request.json();

    // Validate inputs
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize && !isValidFileSize(fileSize)) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    // Generate S3 key
    const key = generateS3Key(folder, filename);
    const bucket = process.env.AWS_BUCKET_NAME || 'social-media-automation-assets';

    // Generate presigned URL
    const uploadUrl = await generatePresignedUploadUrl(bucket, key, contentType);

    // Construct the public URL (will be valid after upload)
    const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    // Record in ImageStorage (metadata only for now, since upload happens on client)
    if (businessId || userId) {
      try {
        await ImageStorageService.storeImage({
          businessId: businessId || undefined,
          userId: userId || undefined,
          originalName: filename,
          fileName: key,
          fileSize: fileSize || 0,
          mimeType: contentType,
          url: publicUrl,
          metadata: {
            status: 'pending_s3_upload',
            key,
            bucket
          }
        });
      } catch (storageError) {
        console.error('Failed to record image metadata in ImageStorage:', storageError);
        // We continue anyway as the presigned URL is still useful
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
        bucket
      }
    });
  } catch (error) {
    console.error('Upload URL generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload - Get upload statistics or list recent uploads
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    const userId = url.searchParams.get('userId');

    const { images, total } = await ImageStorageService.getImages({
      businessId: businessId || undefined,
      userId: userId || undefined,
      limit: 50,
      offset: 0
    });

    return NextResponse.json({
      success: true,
      data: {
        images: images.map(img => ({
          ...img,
          size: Number(img.fileSize)
        })),
        total
      }
    });
  } catch (error) {
    console.error('Upload listing failed:', error);
    return NextResponse.json(
      { error: 'Failed to list uploads' },
      { status: 500 }
    );
  }
}
