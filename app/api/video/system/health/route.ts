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

    // Get system-wide video statistics (for admin/monitoring)
    const [totalJobs, completedJobs, processingJobs, failedJobs] = await Promise.all([
      prisma.videoGenerationJob.count({
        where: { businessId: { in: businessIds } }
      }),
      prisma.videoGenerationJob.count({
        where: {
          businessId: { in: businessIds },
          status: "COMPLETED"
        }
      }),
      prisma.videoGenerationJob.count({
        where: {
          businessId: { in: businessIds },
          status: "PROCESSING"
        }
      }),
      prisma.videoGenerationJob.count({
        where: {
          businessId: { in: businessIds },
          status: "FAILED"
        }
      })
    ]);

    // Get provider distribution
    const providerStats = await prisma.videoGenerationJob.groupBy({
      by: ['provider'],
      where: { businessId: { in: businessIds } },
      _count: { id: true }
    });

    // Get recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentJobs = await prisma.videoGenerationJob.findMany({
      where: {
        businessId: { in: businessIds },
        createdAt: { gte: twentyFourHoursAgo }
      },
      select: {
        id: true,
        status: true,
        provider: true,
        createdAt: true,
        completedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Calculate processing metrics
    const completedJobsWithTime = await prisma.videoGenerationJob.findMany({
      where: {
        businessId: { in: businessIds },
        status: "COMPLETED",
        completedAt: { not: null }
      },
      select: {
        id: true,
        createdAt: true,
        completedAt: true,
        duration: true
      }
    });

    const averageProcessingTime = completedJobsWithTime.length > 0
      ? completedJobsWithTime.reduce((sum, job) => {
          const processingTime = new Date(job.completedAt!).getTime() - new Date(job.createdAt).getTime();
          return sum + processingTime;
        }, 0) / completedJobsWithTime.length / 1000 / 60 // Convert to minutes
      : 0;

    // System health indicators
    const systemHealth = {
      activeJobs: processingJobs,
      queueLength: processingJobs,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      recentActivity: recentJobs.length,
      errorRate: totalJobs > 0 ? Math.round((failedJobs / totalJobs) * 100) : 0
    };

    return NextResponse.json({
      health: systemHealth,
      stats: {
        total: totalJobs,
        completed: completedJobs,
        processing: processingJobs,
        failed: failedJobs
      },
      providers: providerStats,
      recentActivity: recentJobs.map(job => ({
        id: job.id,
        status: job.status,
        provider: job.provider,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        processingTime: job.completedAt && job.createdAt
          ? (new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000
          : null
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching system health:", error);
    return NextResponse.json(
      { error: "Failed to fetch system health" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'cleanup') {
      // Cleanup old jobs (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedJobs = await prisma.videoGenerationJob.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] }
        }
      });

      await SystemLogger.logActivity({
        action: "VIDEO_SYSTEM_CLEANUP",
        entity: "System",
        entityId: session.user.id,
        userId: session.user.id,
        details: { deletedCount: deletedJobs.count }
      });

      return NextResponse.json({
        success: true,
        deletedCount: deletedJobs.count,
        message: `Cleaned up ${deletedJobs.count} old jobs`
      });
    }

    if (action === 'reset_failed') {
      // Reset failed jobs to pending for retry
      const resetJobs = await prisma.videoGenerationJob.updateMany({
        where: {
          status: "FAILED"
        },
        data: {
          status: "PENDING",
          error: null
        }
      });

      await SystemLogger.logActivity({
        action: "VIDEO_SYSTEM_RESET_FAILED",
        entity: "System",
        entityId: session.user.id,
        userId: session.user.id,
        details: { resetCount: resetJobs.count }
      });

      return NextResponse.json({
        success: true,
        resetCount: resetJobs.count,
        message: `Reset ${resetJobs.count} failed jobs to pending`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Error in system operation:", error);
    return NextResponse.json(
      { error: "Failed to perform system operation" },
      { status: 500 }
    );
  }
}
