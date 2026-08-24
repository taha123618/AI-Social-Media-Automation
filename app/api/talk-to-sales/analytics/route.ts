import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, newLeads, contacted, completed, converted, todayCount] = await Promise.all([
      prisma.demoLead.count(),
      prisma.demoLead.count({ where: { status: "NEW" } }),
      prisma.demoLead.count({ where: { status: "CONTACTED" } }),
      prisma.demoLead.count({ where: { status: "COMPLETED" } }),
      prisma.demoLead.count({ where: { status: "CONVERTED" } }),
      prisma.demoLead.count({ where: { createdAt: { gte: today } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { total, new: newLeads, contacted, completed, converted, todayCount },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
