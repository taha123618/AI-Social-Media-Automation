import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.salesSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.salesSettings.create({ data: { id: "default" } });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const settings = await prisma.salesSettings.upsert({
      where: { id: "default" },
      update: {
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.notificationEmails !== undefined && { notificationEmails: body.notificationEmails }),
        ...(body.autoAssignLead !== undefined && { autoAssignLead: body.autoAssignLead }),
        ...(body.confirmationTemplate !== undefined && { confirmationTemplate: body.confirmationTemplate }),
        ...(body.adminTemplate !== undefined && { adminTemplate: body.adminTemplate }),
        ...(body.thankYouPage !== undefined && { thankYouPage: body.thankYouPage }),
        ...(body.meetingDuration !== undefined && { meetingDuration: body.meetingDuration }),
        ...(body.dateRangeDays !== undefined && { dateRangeDays: body.dateRangeDays }),
        ...(body.crmProvider !== undefined && { crmProvider: body.crmProvider }),
        ...(body.calendarProvider !== undefined && { calendarProvider: body.calendarProvider }),
        ...(body.slackWebhook !== undefined && { slackWebhook: body.slackWebhook }),
        ...(body.discordWebhook !== undefined && { discordWebhook: body.discordWebhook }),
      },
      create: { id: "default", ...body },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
