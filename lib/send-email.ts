import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST || "gmail",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "saad@devteampro.com",
    pass: process.env.EMAIL_PASSWORD || "efkcvxwxghikaoyg",
  },
});

export async function sendEmailImmediate(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const info = await transporter.sendMail({
      from: `"AI Social Media Automation" <${process.env.EMAIL_USER || "saad@devteampro.com"}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to} | messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to send email to ${to}:`, message);
    return { success: false, error: message };
  }
}
