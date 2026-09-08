import { getEmailTemplate } from '@/utils/emailTemplates';
import { addEmailToQueue, EmailData, EmailType } from './emailQueue';

export const sendEmail = async (
  to: string,
  type: EmailType,
  data: Record<string, unknown>
) => {
  const template = getEmailTemplate(type, data);

  const emailData: EmailData = {
    to,
    subject: template.subject,
    html: template.html,
    type,
    data,
  };

  await addEmailToQueue(emailData);
};

// Send registration OTP verification email
export const sendRegisterOtpEmail = async (email: string, otp: string, name?: string) => {
  console.log(`🔐 [REGISTER 2FA OTP] Generating code for ${email}: ${otp}`);
  const template = getEmailTemplate('register-otp', { otp, name });

  try {
    const { sendEmailImmediate } = await import('./send-email');
    const result = await sendEmailImmediate(email, template.subject, template.html);
    if (result?.success) {
      return;
    }
    console.warn(`⚠️ Immediate SMTP send failed (${result?.error}). Enqueueing to BullMQ email queue...`);
  } catch (err) {
    console.warn('⚠️ sendEmailImmediate exception. Enqueueing to BullMQ email queue...', err);
  }

  // BullMQ Queue Fallback
  try {
    await sendEmail(email, 'register-otp', { otp, name });
  } catch (queueErr) {
    console.error('❌ Failed to enqueue OTP email to BullMQ:', queueErr);
  }
};

// Send registration/welcome email
export const sendRegistrationEmail = async (email: string, name?: string) => {
  await sendEmail(email, 'registration', {
    name,
    dashboardUrl: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
  });
};

// Send forgot password email
export const sendForgotPasswordEmail = async (
  email: string,
  resetUrl: string,
  name?: string
) => {
  await sendEmail(email, 'forgot-password', { name, resetUrl });
};

// Send team invitation email
export const sendInvitationEmail = async (
  email: string,
  inviterName: string,
  businessName: string,
  role: string,
  inviteUrl: string
) => {
  await sendEmail(email, 'team-invitation', {
    inviterName,
    businessName,
    role,
    inviteUrl,
  });
};
// Send admin invitation email
export const sendAdminInvitationEmail = async (
  email: string,
  name: string,
  role: string
) => {
  await sendEmail(email, "admin-invitation", {
    name,
    role,
    loginUrl: `${process.env.APP_URL || "http://localhost:3000"}/admin/login`,
  });
};
