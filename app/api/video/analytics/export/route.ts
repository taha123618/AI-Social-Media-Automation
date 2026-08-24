import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format");
    
    if (!format || !["csv", "json"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Use 'csv' or 'json'" }, { status: 400 });
    }

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get all video jobs for export
    const videoJobs = await prisma.videoGenerationJob.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: "desc" },
      take: 2000 // Limit for performance
    });

    if (format === 'json') {
      // Return JSON data
      const jsonData = videoJobs.map(job => ({
        id: job.id,
        provider: job.provider,
        prompt: job.prompt,
        status: job.status,
        duration: job.duration,
        aspectRatio: job.aspectRatio,
        quality: job.quality,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        videoUrl: job.videoUrl,
        thumbnailUrl: job.thumbnailUrl
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="video-analytics-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    // CSV format
    const csvHeaders = [
      'ID',
      'Provider',
      'Status',
      'Duration',
      'Aspect Ratio',
      'Quality',
      'Created At',
      'Completed At',
      'Processing Time (minutes)',
      'Video URL',
      'Thumbnail URL',
      'Prompt'
    ];

    const csvData = videoJobs.map(job => {
      const processingTime = job.completedAt && job.createdAt
        ? (new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000 / 60
        : 0;

      return [
        job.id,
        job.provider,
        job.status,
        job.duration || '',
        job.aspectRatio || '',
        job.quality || '',
        job.createdAt.toISOString(),
        job.completedAt?.toISOString() || '',
        processingTime.toFixed(2),
        job.videoUrl || '',
        job.thumbnailUrl || '',
        `"${job.prompt.replace(/"/g, '""')}"` // Escape quotes in CSV
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="video-analytics-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    );
  }
}
