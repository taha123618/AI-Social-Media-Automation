import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
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

    // Get all video jobs for user's businesses
    const allJobs = await prisma.videoGenerationJob.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: "desc" },
      take: 1000 // Limit to last 1000 jobs for performance
    });

    // Calculate analytics
    const totalVideos = allJobs.length;
    const completedVideos = allJobs.filter(job => job.status === "COMPLETED").length;
    const failedVideos = allJobs.filter(job => job.status === "FAILED").length;
    const pendingVideos = allJobs.filter(job => job.status === "PENDING").length;
    const processingVideos = allJobs.filter(job => job.status === "PROCESSING").length;

    // Calculate average processing time (for completed jobs)
    const completedJobsWithTime = allJobs.filter(job => 
      job.status === "COMPLETED" && job.createdAt && job.completedAt
    );
    
    const averageProcessingTime = completedJobsWithTime.length > 0
      ? completedJobsWithTime.reduce((sum, job) => {
          const processingTime = new Date(job.completedAt!).getTime() - new Date(job.createdAt).getTime();
          return sum + processingTime;
        }, 0) / completedJobsWithTime.length / 1000 / 60 // Convert to minutes
      : 0;

    // Calculate total credits used (estimated based on duration and quality)
    const totalCreditsUsed = allJobs.reduce((sum, job) => {
      let credits = 0;
      const baseCredits = job.duration || 5;
      
      switch (job.quality?.toLowerCase()) {
        case '4k':
          credits = baseCredits * 3;
          break;
        case 'hd':
          credits = baseCredits * 2;
          break;
        default:
          credits = baseCredits;
      }
      
      return sum + credits;
    }, 0);

    // Most used provider
    const providerCounts = allJobs.reduce((acc, job) => {
      acc[job.provider] = (acc[job.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedProvider = Object.entries(providerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

    // Most used style
    const styleCounts = allJobs.reduce((acc, job) => {
      // Extract style from prompt or use default
      const style = job.prompt.includes('cinematic') ? 'cinematic' :
                   job.prompt.includes('realistic') ? 'realistic' :
                   job.prompt.includes('animated') ? 'animated' : 'other';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "other";

    // Generation trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentJobs = allJobs.filter(job => new Date(job.createdAt) >= thirtyDaysAgo);
    
    const generationTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const count = recentJobs.filter(job => 
        job.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      
      return { date: dateStr, count };
    });

    const analytics = {
      totalVideos,
      completedVideos,
      failedVideos,
      pendingVideos,
      processingVideos,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      totalCreditsUsed,
      mostUsedProvider,
      mostUsedStyle,
      generationTrend,
      successRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error("Error fetching video analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
