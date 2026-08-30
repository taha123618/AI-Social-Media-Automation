import { QueueManager, QUEUE_NAMES } from '../features/scheduler/config/queue.config';

export type EmailType =
  | 'forgot-password'
  | 'registration'
  | 'register-otp'
  | 'team-invitation'
  | 'review-request'
  | 'review-follow-up'
  | 'review-response'
  | 'admin-invitation'
  | 'workflow-notification'
  | 'talk-to-sales-notification';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue (producer) — safe to import from Next.js API routes.
// The Worker (consumer) lives in features/scheduler/workers/emailWorker.ts
// and is only started by the separate `npm run workers` process.
// ─────────────────────────────────────────────────────────────────────────────
export const emailQueue = QueueManager.getQueue<EmailData>(QUEUE_NAMES.EMAIL);

//! Add email to queue
export const addEmailToQueue = async (emailData: EmailData) => {
  const job = await emailQueue.add('send-email', emailData, {
    priority: emailData.type === 'forgot-password' ? 10 : 5,
  });
  console.log(`📧 Queued email for ${emailData.to} | Type: ${emailData.type} | Job ID: ${job.id}`);
  return job;
};

// Queue stats
export const getEmailQueueStatus = async () => {
  return {
    waiting: await emailQueue.getWaitingCount(),
    active: await emailQueue.getActiveCount(),
    completed: await emailQueue.getCompletedCount(),
    failed: await emailQueue.getFailedCount(),
  };
};

export default emailQueue;
