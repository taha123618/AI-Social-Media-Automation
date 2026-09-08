import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  let imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  // Unwrap accidentally double-proxied URLs
  while (imageUrl && imageUrl.includes('/api/social/proxy-image?url=')) {
    const rawNested: string | null = new URL(imageUrl, 'http://localhost').searchParams.get('url');
    if (rawNested) imageUrl = rawNested;
    else break;
  }

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  if (imageUrl.startsWith('pending://')) {
    try {
      const image = await prisma.imageStorage.findFirst({
        where: { url: imageUrl }
      });

      if (image?.data) {
        return new NextResponse(image.data as any, {
          headers: {
            'Content-Type': image.mimeType,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      }
      return new NextResponse('Image data not found', { status: 404 });
    } catch (dbError) {
      console.error('[Proxy Image DB Error]:', dbError);
      return new NextResponse('Error fetching image from database', { status: 500 });
    }
  }

  try {
    const fetchUrl = imageUrl.startsWith('/') ? `${origin}${imageUrl}` : imageUrl;
    const response = await fetch(fetchUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      console.warn(`[Proxy Image Upstream Error] ${response.status} for ${fetchUrl}`);
      // If unauthorized or gone, return a clean 404 to the frontend instead of 500
      if (response.status === 401 || response.status === 403 || response.status === 410) {
        return new NextResponse('Upstream image link expired or unauthorized', { status: 404 });
      }
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('[Proxy Image Error]:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
