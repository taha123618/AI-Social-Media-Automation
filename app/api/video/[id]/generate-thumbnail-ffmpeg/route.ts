import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';

export async function POST(
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

    // Get video details
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    const video = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds }
      }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (!video.videoUrl) {
      return NextResponse.json({ error: "No video URL available" }, { status: 400 });
    }

    // Generate thumbnail using FFmpeg
    const thumbnailUrl = await generateThumbnailWithFFmpeg(video.videoUrl, videoId);

    if (!thumbnailUrl) {
      return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 });
    }

    // Update video with generated thumbnail
    const updatedVideo = await prisma.videoGenerationJob.update({
      where: { id: videoId },
      data: { thumbnailUrl }
    });

    // Log thumbnail generation
    await SystemLogger.logActivity({
      action: "VIDEO_THUMBNAIL_GENERATED",
      entity: "VideoGenerationJob",
      entityId: videoId,
      userId: session.user.id,
      details: { provider: video.provider, method: "ffmpeg" }
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      thumbnailUrl
    });

  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
}

async function generateThumbnailWithFFmpeg(videoUrl: string, videoId: string): Promise<string | null> {
  try {
    // Create temporary directory
    const tempDir = process.env.THUMBNAIL_TEMP_DIR || '/tmp';
    const outputPath = path.join(tempDir, `thumbnail-${videoId}.jpg`);

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true }).catch(() => { });

    // Use fluent-ffmpeg for better error handling and cross-platform support
    const ffmpegInstance = ffmpeg();

    // Configure FFmpeg with environment variables
    const quality = process.env.THUMBNAIL_QUALITY || '2';
    const width = process.env.THUMBNAIL_WIDTH || '640';
    const height = process.env.THUMBNAIL_HEIGHT || '360';

    console.log('Generating thumbnail with fluent-ffmpeg for video:', videoId);

    // Set up FFmpeg command and return the promise
    return new Promise((resolve, reject) => {
      ffmpegInstance
        .input(videoUrl)
        .seek('00:00:01') // Seek to 1 second
        .frames(1) // Extract 1 frame
        .format('jpg') // Output format
        .size(`${width}x${height}`) // Resize
        .videoBitrate('1000k') // Target bitrate
        .outputOptions([
          '-q:v', quality, // Quality setting
          '-vf', `scale=${width}:${height}`, // Video filter
          '-y' // Overwrite output
        ])
        .output(outputPath)
        .on('end', async () => {
          console.log('FFmpeg process completed successfully');

          try {
            // Check if thumbnail was created
            await fs.access(outputPath);

            // Read and convert to base64
            const data = await fs.readFile(outputPath);
            const base64Thumbnail = `data:image/jpeg;base64,${data.toString('base64')}`;

            // Clean up temporary file
            await fs.unlink(outputPath).catch(err => {
              if (err) console.error('Error cleaning up temp file:', err);
            });

            resolve(base64Thumbnail);
          } catch (error) {
            console.error('Error processing thumbnail:', error);
            reject(error);
          }
        })
        .on('error', (error: any) => {
          console.error('FFmpeg process error:', error);
          reject(new Error(`FFmpeg failed: ${error.message}`));
        })
        .on('stderr', (stderrLine: string | string[]) => {
          console.error('FFmpeg stderr:', stderrLine);
          if (stderrLine.includes('could not find file')) {
            reject(new Error('Video file not accessible'));
          }
        })
        .run();
    });

  } catch (error) {
    console.error('Error in thumbnail generation:', error);
    return null;
  }
}
