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

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get detailed usage stats
    const usageStats = await prisma.videoGenerationJob.findMany({
      where: { businessId: { in: businessIds } },
      select: {
        id: true,
        provider: true,
        prompt: true,
        duration: true,
        quality: true,
        createdAt: true,
        completedAt: true,
        status: true,
        aspectRatio: true
      },
      orderBy: { createdAt: "desc" },
      take: 500 // Limit for performance
    });

    // Process and enhance the data
    const processedStats = usageStats.map(job => {
      // Extract style from prompt
      const style = job.prompt.includes('cinematic') ? 'cinematic' :
                   job.prompt.includes('realistic') ? 'realistic' :
                   job.prompt.includes('animated') ? 'animated' :
                   job.prompt.includes('artistic') ? 'artistic' :
                   job.prompt.includes('professional') ? 'professional' : 'other';

      // Calculate processing time
      const processingTime = job.completedAt && job.createdAt
        ? new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()
        : 0;

      // Calculate credits used
      let creditsUsed = 0;
      const baseCredits = job.duration || 5;
      
      switch (job.quality?.toLowerCase()) {
        case '4k':
          creditsUsed = baseCredits * 3;
          break;
        case 'hd':
          creditsUsed = baseCredits * 2;
          break;
        default:
          creditsUsed = baseCredits;
      }

      return {
        jobId: job.id,
        provider: job.provider,
        style,
        duration: job.duration || 0,
        quality: job.quality || 'standard',
        creditsUsed,
        processingTime: processingTime / 1000, // Convert to seconds
        createdAt: job.createdAt.toISOString(),
        status: job.status,
        aspectRatio: job.aspectRatio || '16:9'
      };
    });

    return NextResponse.json(processedStats);

  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
