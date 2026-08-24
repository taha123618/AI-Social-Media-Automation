"use server";

import { revalidatePath } from "next/cache";
import { headers as getHeaders } from "next/headers";
import prisma from "@/lib/prisma";
import { addEmailToQueue } from "@/lib/emailQueue";
import { sendEmailImmediate } from "@/lib/send-email";
import { getDemoEmailTemplate } from "@/utils/demo-email-templates";
import { demoFormSchema, type FormState } from "../schema/form.schema";

function parseFormData(formData: FormData) {
  return {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    company: formData.get("company") as string,
    teamSize: formData.get("teamSize") as string,
    jobTitle: formData.get("jobTitle") as string,
    phone: formData.get("phone") as string,
    country: formData.get("country") as string,
    useCase: formData.get("useCase") as string,
    preferredDate: formData.get("preferredDate") as string,
    preferredTime: formData.get("preferredTime") as string,
    notes: (formData.get("notes") as string) || "",
  };
}

// ── In-memory rate limiter (replace with Redis in production) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 submissions per window per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ── Honeypot / spam detection ──
function isSpam(formData: FormData): boolean {
  const honeypot = formData.get("website") as string;
  if (honeypot) return true;
  const timeField = formData.get("formLoadedAt") as string;
  if (timeField) {
    const elapsed = Date.now() - parseInt(timeField);
    if (elapsed < 2000) return true;
  }
  return false;
}

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export async function submitDemoAction(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const headersList = await getHeaders();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // ── Rate limit check ──
    if (!checkRateLimit(ip)) {
      return {
        status: "error",
        message: "Too many requests. Please wait a minute before trying again.",
        errors: {},
      };
    }

    // ── Spam check ──
    if (isSpam(formData)) {
      return {
        status: "success",
        message: "Demo request received! We'll be in touch within 24 hours.",
        errors: {},
      };
    }

    const data = parseFormData(formData);
    const sanitized = {
      ...data,
      firstName: sanitize(data.firstName),
      lastName: sanitize(data.lastName),
      company: sanitize(data.company),
      notes: data.notes ? sanitize(data.notes) : "",
    };

    const parsed = demoFormSchema.safeParse(sanitized);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[key] = messages[0];
        }
      }
      return { status: "error", message: "Please fix the errors below.", errors };
    }

    const values = parsed.data;

    // ── 1. Check settings ──
    const settings = await prisma.salesSettings.findUnique({ where: { id: "default" } });
    if (settings && !settings.enabled) {
      return {
        status: "error",
        message: "Demo requests are currently disabled. Please try again later.",
        errors: {},
      };
    }

    // ── 2. Duplicate detection (same email within 24h) ──
    const recentLead = await prisma.demoLead.findFirst({
      where: {
        email: values.email,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentLead) {
      return {
        status: "success",
        message: `We already received your request! We'll be in touch within 24 hours, ${values.firstName}.`,
        errors: {},
      };
    }

    // ── 3. Store the lead in the database ──
    const lead = await prisma.demoLead.create({
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        company: values.company,
        phone: values.phone,
        country: values.country,
        teamSize: values.teamSize,
        jobTitle: values.jobTitle,
        useCase: values.useCase,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime,
        notes: values.notes || null,
        source: "MARKETING_PAGE",
        status: "NEW",
        metadata: {
          submittedAt: new Date().toISOString(),
          userAgent: headersList.get("user-agent") || null,
          ip,
        },
      },
    });

    // ── 4. Create CRM lead record (stub) ──
    const crmResult = { synced: false, provider: settings?.crmProvider || null };

    // ── 5. Trigger workflow automation (stub) ──

    // ── 6. Send notification email to sales team ──
    const proto = headersList.get("x-forwarded-proto") || "https";
    const host = headersList.get("host") || "localhost:3000";
    const baseUrl = `${proto}://${host}`;
    const leadUrl = `${baseUrl}/admin/talk-to-sales/leads/${lead.id}`;

    const salesTemplate = getDemoEmailTemplate("sales-notification", { ...values, leadUrl });
    const recipients = settings?.notificationEmails?.length
      ? settings.notificationEmails
      : ["sales@socialai.com"];

    for (const recipient of recipients) {
      try {
        await addEmailToQueue({
          to: recipient,
          subject: salesTemplate.subject,
          html: salesTemplate.html,
          type: "talk-to-sales-notification",
          data: { leadId: lead.id, type: "demo-sales-notification" },
        });
      } catch (qErr) {
        console.error("BullMQ queue failed, sending directly:", qErr);
        const result = await sendEmailImmediate(recipient, salesTemplate.subject, salesTemplate.html);
        if (!result.success) {
          console.error("Failed to send sales notification to:", recipient, result.error);
        }
      }
    }

    // ── 7. Send confirmation email to prospect ──
    const prospectTemplate = getDemoEmailTemplate("prospect-confirmation", {
      ...values,
      meetingDuration: settings?.meetingDuration || 30,
      pricingUrl: `${baseUrl}/pricing`,
      blogUrl: `${baseUrl}/blog`,
    });

    try {
      await addEmailToQueue({
        to: values.email,
        subject: prospectTemplate.subject,
        html: prospectTemplate.html,
        type: "talk-to-sales-notification",
        data: { leadId: lead.id, type: "demo-prospect-confirmation" },
      });
    } catch (qErr) {
      console.error("BullMQ queue failed, sending directly:", qErr);
      const result = await sendEmailImmediate(values.email, prospectTemplate.subject, prospectTemplate.html);
      if (!result.success) {
        console.error("Failed to send prospect confirmation to:", values.email, result.error);
      }
    }

    // ── 8. Log analytics event ──
    try {
      await prisma.activityLog.create({
        data: {
          action: "DEMO_SUBMITTED",
          entity: "DemoLead",
          entityId: lead.id,
          details: {
            email: values.email,
            company: values.company,
            useCase: values.useCase,
            source: "MARKETING_PAGE",
            crmSynced: crmResult.synced,
          },
        },
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }

    // ── 9. Trigger Slack/Discord notifications ──
    if (settings?.slackWebhook) {
      fetch(settings.slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚀 *New Demo Request*\n${values.firstName} ${values.lastName} — ${values.company}\nUse Case: ${values.useCase}\n<${leadUrl}|View Lead>`,
        }),
      }).catch(() => { });
    }

    revalidatePath("/admin/talk-to-sales/leads");

    // ── 10. Return success ──
    return {
      status: "success",
      message: `Demo request received! We'll be in touch within 24 hours, ${values.firstName}.`,
      errors: {},
    };
  } catch (error) {
    console.error("Demo submission error:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again or email us at sales@socialai.com.",
      errors: {},
    };
  }
}
