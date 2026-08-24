import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');

    if (!businessId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID or User ID is required'
      }, { status: 400 });
    }

    // Use businessId if provided, otherwise fallback to userId for backward compatibility
    const whereClause = businessId
      ? { businessId } as const
      : userId
        ? { userId } as const
        : {};

    const jobs = await prisma.imageGenerationJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('[API] Image jobs fetch error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, businessId, userId } = body;

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    if (!businessId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID or User ID is required'
      }, { status: 400 });
    }

    // Use businessId if provided, otherwise fallback to userId
    const whereClause = businessId
      ? { id: jobId, businessId }
      : { id: jobId, userId };

    const job = await prisma.imageGenerationJob.findFirst({
      where: whereClause
    });

    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Image generation job not found'
      }, { status: 404 });
    }

    await prisma.imageGenerationJob.delete({
      where: { id: jobId }
    });

    console.log(`[API] Image job ${jobId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Image generation job deleted successfully'
    });

  } catch (error) {
    console.error('[API] Image job deletion error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
