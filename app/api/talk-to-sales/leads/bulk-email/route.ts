import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { addEmailToQueue } from "@/lib/emailQueue";
import { getDemoEmailTemplate } from "@/utils/demo-email-templates";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "super_admin" && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { leadIds, subject, body } = await req.json() as {
      leadIds?: string[];
      subject?: string;
      body?: string;
    };

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, error: "leadIds array is required" }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: "Subject is required" }, { status: 400 });
    }
    if (!body || !body.trim()) {
      return NextResponse.json({ success: false, error: "Body is required" }, { status: 400 });
    }

    const leads = await prisma.demoLead.findMany({
      where: { id: { in: leadIds } },
    });

    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: "No leads found" }, { status: 404 });
    }

    const template = getDemoEmailTemplate("direct-email", { subject, body });
    const newIds: string[] = [];

    for (const lead of leads) {
      await addEmailToQueue({
        to: lead.email,
        subject: template.subject,
        html: template.html,
        type: "talk-to-sales-notification",
        data: { leadId: lead.id, type: "admin-bulk-email" },
      });

      if (lead.status === "NEW") {
        newIds.push(lead.id);
      }
    }

    if (newIds.length > 0) {
      await prisma.demoLead.updateMany({
        where: { id: { in: newIds } },
        data: { status: "CONTACTED" },
      });
    }

    await prisma.activityLog.create({
      data: {
        action: "BULK_EMAIL_SENT",
        entity: "DemoLead",
        entityId: leads.map((l) => l.id).join(","),
        details: {
          subject,
          recipientCount: leads.length,
          sentBy: session.email || session.id,
          updatedToContacted: newIds.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: leads.length,
        emailsQueued: leads.length,
        statusUpdatedToContacted: newIds.length,
      },
    });
  } catch (error) {
    console.error("Failed to send bulk email:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
