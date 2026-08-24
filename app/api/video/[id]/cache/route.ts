import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface CacheConfig {
  maxAge: number; // seconds
  sMaxAge: number; // seconds for shared caches (CDN)
  mustRevalidate: boolean;
  noCache: boolean;
}

// Cache configurations for different video types
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  'thumbnail': {
    maxAge: 86400, // 24 hours
    sMaxAge: 604800, // 7 days for CDN
    mustRevalidate: false,
    noCache: false
  },
  'video': {
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 24 hours for CDN
    mustRevalidate: true,
    noCache: false
  },
  'preview': {
    maxAge: 300, // 5 minutes
    sMaxAge: 1800, // 30 minutes for CDN
    mustRevalidate: true,
    noCache: false
  },
  'no-cache': {
    maxAge: 0,
    sMaxAge: 0,
    mustRevalidate: true,
    noCache: true
  }
};

function getCacheHeaders(type: string): Record<string, string> {
  const config = CACHE_CONFIGS[type] || CACHE_CONFIGS['no-cache'];

  if (config.noCache) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  const directives = [
    config.maxAge > 0 ? `max-age=${config.maxAge}` : '',
    config.sMaxAge > 0 ? `s-maxage=${config.sMaxAge}` : '',
    config.mustRevalidate ? 'must-revalidate' : '',
    'public'
  ].filter(Boolean).join(', ');

  return {
    'Cache-Control': directives,
    'ETag': Date.now().toString(), // Simple ETag for cache validation
    'Vary': 'Accept-Encoding, User-Agent'
  };
}

function getCDNHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'video'; // thumbnail, video, preview

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get video job
    const videoJob = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds }
      }
    });

    if (!videoJob) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    let url: string | undefined;
    let contentType: string = 'video/mp4';

    switch (type) {
      case 'thumbnail':
        url = videoJob.thumbnailUrl ?? undefined;
        contentType = 'image/jpeg';
        break;
      case 'preview':
        // For preview, we'll serve a lower quality version or redirect
        url = videoJob.videoUrl ?? undefined;
        // Note: In a real implementation, you might transcode to lower quality
        break;
      default:
        url = videoJob.videoUrl ?? undefined;
    }

    if (!url) {
      return NextResponse.json({ error: "Media not available" }, { status: 404 });
    }

    // Check if the URL is external (from Runway/Luma) or local
    if (url.startsWith('http')) {
      // External URL - redirect with cache headers
      const response = NextResponse.redirect(url);

      // Apply cache headers
      const cacheHeaders = getCacheHeaders(type);
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Apply CDN headers
      const cdnHeaders = getCDNHeaders();
      Object.entries(cdnHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Log access for analytics
      await SystemLogger.logActivity({
        action: `VIDEO_${type.toUpperCase()}_ACCESSED`,
        entity: "VideoGenerationJob",
        entityId: videoId,
        userId: session.user.id,
        details: { type, businessId: videoJob.businessId, url: url.substring(0, 100) } // Log first 100 chars of URL
      });

      return response;
    }

    // For local files, you would implement file serving logic here
    // This is a placeholder for local file serving
    return NextResponse.json({ error: "Local file serving not implemented" }, { status: 501 });

  } catch (error) {
    console.error("Error serving cached video:", error);
    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 }
    );
  }
}

// HEAD request for cache validation
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { id: videoId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'video';

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Check if video exists
    const videoJob = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds }
      },
      select: { id: true, createdAt: true, completedAt: true }
    });

    if (!videoJob) {
      return new NextResponse(null, { status: 404 });
    }

    // Return cache headers for validation
    const response = new NextResponse(null, { status: 200 });
    const cacheHeaders = getCacheHeaders(type);
    const cdnHeaders = getCDNHeaders();

    Object.entries({ ...cacheHeaders, ...cdnHeaders }).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set last modified based on video completion or creation time
    const lastModified = videoJob.completedAt ?? videoJob.createdAt;
    response.headers.set('Last-Modified', lastModified.toUTCString());

    return response;

  } catch (error) {
    console.error("Error in HEAD request:", error);
    return new NextResponse(null, { status: 500 });
  }
}
