import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/features/image_generation/services/image.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    console.log(`[API] Checking image generation job status: ${jobId}`);

    const result = await ImageService.checkJobStatus(jobId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[API] Image job status check error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
