import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { addEmailToQueue } from "@/lib/emailQueue";
import { getDemoEmailTemplate } from "@/utils/demo-email-templates";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { subject, body } = await req.json() as { subject?: string; body?: string };

    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: "Subject is required" }, { status: 400 });
    }
    if (!body || !body.trim()) {
      return NextResponse.json({ success: false, error: "Body is required" }, { status: 400 });
    }

    const lead = await prisma.demoLead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const template = getDemoEmailTemplate("direct-email", { subject, body });

    await addEmailToQueue({
      to: lead.email,
      subject: template.subject,
      html: template.html,
      type: "talk-to-sales-notification",
      data: { leadId: lead.id, type: "admin-direct-email" },
    });

    if (lead.status === "NEW") {
      await prisma.demoLead.update({
        where: { id },
        data: { status: "CONTACTED" },
      });
    }

    await prisma.activityLog.create({
      data: {
        action: "EMAIL_SENT",
        entity: "DemoLead",
        entityId: lead.id,
        details: {
          subject,
          to: lead.email,
          sentBy: session.email || session.id,
          previousStatus: lead.status,
          newStatus: lead.status === "NEW" ? "CONTACTED" : lead.status,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
