import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const search = searchParams.get("search") || undefined;
    const queue = searchParams.get("queue") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { queueName: { contains: search, mode: "insensitive" } },
        { status: { contains: search, mode: "insensitive" } },
        { jobId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (queue) where.queueName = queue;
    if (status) where.status = status;

    const [total, logs] = await Promise.all([
      prisma.jobLog.count({ where }),
      prisma.jobLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Summary stats
    const stats = await prisma.jobLog.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const queues = await prisma.jobLog.groupBy({
      by: ["queueName"],
      _count: { queueName: true },
    });

    return NextResponse.json({ total, logs, page, limit, stats, queues });
  } catch (error) {
    console.error("Error fetching job logs:", error);
    return NextResponse.json({ error: "Failed to fetch job logs" }, { status: 500 });
  }
}
