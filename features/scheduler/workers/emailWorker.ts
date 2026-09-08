import 'dotenv/config';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import { createTransport } from "nodemailer";
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES } from '../config/queue.config';
import { EmailData } from '@/lib/emailQueue';

// ─────────────────────────────────────────────────────────────────────────────
// Nodemailer transporter
// ─────────────────────────────────────────────────────────────────────────────
const createEmailWorkerTransporter = () => {
  const service = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!service || !user || !pass) {
    throw new Error('EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD must be defined');
  }

  if (service.toLowerCase() === "gmail") {
    return createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return createTransport({
    host: service,
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587"),
    secure: process.env.EMAIL_USE_TLS === "false" ? false : process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
};

const transporter = createEmailWorkerTransporter();

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BullMQ Worker (consumer) — only runs in the scheduler process,
// never in the Next.js web server.
// ─────────────────────────────────────────────────────────────────────────────
export const emailWorker = new Worker<EmailData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailData>) => {
    const { to, subject, html } = job.data;

    console.log(`📤 Processing email job ${job.id} → ${to}`);

    const from = process.env.EMAIL_FROM || `"AI Social Media Automation" <${process.env.EMAIL_USER}>`;
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} | messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  },
  {
    connection: REDIS_CONNECTION_CONFIG as ConnectionOptions,
    concurrency: 5,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Worker event listeners
// ─────────────────────────────────────────────────────────────────────────────
emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed for ${job.data.to}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed for ${job?.data?.to}:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('❌ Email worker error:', err);
});

emailWorker.on('ready', () => {
  console.log('🚀 Email worker ready and listening for jobs...');
});

console.log('📧 Email worker initializing...');
