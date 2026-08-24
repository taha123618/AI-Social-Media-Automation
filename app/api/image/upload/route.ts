import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageStorageService } from '@/services/image-storage.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    if (!businessId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Either businessId or userId is required'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Allowed types: ' + allowedTypes.join(', ')
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 10MB'
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ingest image via ImageStorageService (handles S3 and DB)
    const storedImage = await ImageStorageService.ingestImageFromBuffer(
      buffer,
      file.name,
      file.type,
      {
        businessId,
        userId: userId || undefined,
        folder: 'uploads/images'
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        filename: storedImage.fileName,
        originalName: storedImage.originalName,
        size: Number(storedImage.fileSize),
        type: storedImage.mimeType,
        url: storedImage.url,
        id: storedImage.id,
        message: 'Image uploaded successfully'
      }
    });

  } catch (error) {
    console.error('[API] Image upload error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');

    if (!businessId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Either businessId or userId parameter is required'
      }, { status: 400 });
    }

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
    console.error('[API] Image list error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
