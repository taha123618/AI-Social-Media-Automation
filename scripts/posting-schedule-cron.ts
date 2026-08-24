/**
 * Posting Schedule Cron Worker
 * ────────────────────────────
 * Runs every minute and calls the /api/posting-schedule/tick endpoint.
 * Start with:  npm run worker:posting-schedule
 *
 * Requires: NEXT_PUBLIC_APP_URL and optionally CRON_SECRET in .env
 */
import 'dotenv/config';
import { SystemLogger } from '@/features/system/services/logger.service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;
const TICK_URL = `${APP_URL}/api/posting-schedule/tick`;
const jobName = 'PostingScheduleTick';

async function tick() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (CRON_SECRET) headers['Authorization'] = `Bearer ${CRON_SECRET}`;

  try {
    const startTime = Date.now();
    const res = await fetch(TICK_URL, { method: 'POST', headers });
    const data = await res.json();
    const duration = Date.now() - startTime;
    const ts = new Date().toISOString().substring(0, 19).replace('T', ' ');

    console.log(`[${ts}] posting-schedule/tick →`, data);

    SystemLogger.logCron(jobName, 'SUCCESS', {
      message: `Tick response: ${JSON.stringify(data)}`,
      duration
    });
  } catch (err) {
    console.error('[posting-schedule/tick] error:', err);
    SystemLogger.logCron(jobName, 'FAILURE', {
      message: `Tick failed: ${err}`,
      error: err
    });
  }
}

// Run immediately then every 60 seconds
tick();
setInterval(tick, 60_000);

console.log(`Posting schedule cron started. Ticking every 60s → ${TICK_URL}`);
SystemLogger.logCron(jobName, 'START', { message: `Scheduler tick started targeting ${TICK_URL}` });

