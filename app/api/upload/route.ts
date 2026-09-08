import { NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateS3Key, isValidImageType, isValidFileSize } from '@/lib/s3';
import { ImageStorageService } from '@/services/image-storage.service';
import { SecurityService } from '@/lib/security';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType, fileSize, folder = 'uploads', businessId } = await request.json();

    // Validate inputs
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type are required' },
        { status: 400 }
      );
    }

    // Validate and sanitize filename against path traversal
    const safeFilename = SecurityService.sanitizeFilename(filename);

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

    // Verify tenant authorization if businessId is supplied
    if (businessId) {
      const membership = await prisma.businessMember.findFirst({
        where: { businessId, userId: session.user.id },
      });
      if (!membership) {
        return NextResponse.json(
          { error: 'Forbidden: Access denied to this business' },
          { status: 403 }
        );
      }
    }

    // Generate S3 key with sanitized filename
    const key = generateS3Key(folder, safeFilename);
    const bucket = process.env.AWS_BUCKET_NAME || 'social-media-automation-assets';

    // Generate presigned URL
    const uploadUrl = await generatePresignedUploadUrl(bucket, key, contentType);

    // Construct the public URL (will be valid after upload)
    const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    // Record in ImageStorage (metadata only for now, since upload happens on client)
    try {
      await ImageStorageService.storeImage({
        businessId: businessId || undefined,
        userId: session.user.id,
        originalName: safeFilename,
        fileName: key,
        fileSize: fileSize || 0,
        mimeType: contentType,
        url: publicUrl,
        metadata: {
          status: 'pending_s3_upload',
          key,
          bucket,
        },
      });
    } catch (storageError) {
      console.error('Failed to record image metadata in ImageStorage:', storageError);
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
        bucket,
      },
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
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');

    // If businessId is specified, verify caller belongs to that business
    if (businessId) {
      const membership = await prisma.businessMember.findFirst({
        where: { businessId, userId: session.user.id },
      });
      if (!membership) {
        return NextResponse.json(
          { error: 'Forbidden: Access denied to this business' },
          { status: 403 }
        );
      }
    }

    const { images, total } = await ImageStorageService.getImages({
      businessId: businessId || undefined,
      userId: businessId ? undefined : session.user.id,
      limit: 50,
      offset: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        images: images.map((img) => ({
          ...img,
          size: Number(img.fileSize),
        })),
        total,
      },
    });
  } catch (error) {
    console.error('Upload listing failed:', error);
    return NextResponse.json(
      { error: 'Failed to list uploads' },
      { status: 500 }
    );
  }
}
