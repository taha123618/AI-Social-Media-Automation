import nodemailer from "nodemailer";

export function getEmailTransporter() {
  const service = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!service || !user || !pass) {
    throw new Error('EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD must be defined');
  }

  if (service.toLowerCase() === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: service,
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587"),
    secure: process.env.EMAIL_USE_TLS === "false" ? false : process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmailImmediate(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    const from = process.env.EMAIL_FROM || `"AI Social Media Automation" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`✅ [EMAIL SUCCESS] Sent to ${to} | Subject: "${subject}" | messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${to}:`, message);
    return { success: false, error: message };
  }
}

