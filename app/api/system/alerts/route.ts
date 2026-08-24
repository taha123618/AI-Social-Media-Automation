import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface AlertmanagerPayload {
  version?: string;
  status?: string;
  receiver?: string;
  alerts?: Array<{
    status: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
    startsAt?: string;
    endsAt?: string;
  }>;
}

/**
 * Webhook handler for Prometheus Alertmanager notifications
 * Automatically records alert events in system error and audit logs
 */
export async function POST(req: NextRequest) {
  try {
    const payload: AlertmanagerPayload = await req.json();
    const alerts = payload.alerts || [];

    for (const alert of alerts) {
      const alertName = alert.labels?.alertname || 'UnknownAlert';
      const severity = alert.labels?.severity || 'warning';
      const summary = alert.annotations?.summary || alertName;
      const description = alert.annotations?.description || '';

      console.warn(`[ALERTMANAGER EVENT] severity=${severity} alert=${alertName}: ${summary} - ${description}`);

      // Record in ErrorLog table if severity is critical or warning
      try {
        await prisma.errorLog.create({
          data: {
            message: `[PROMETHEUS ALERT] ${alertName}: ${summary}`,
            stack: description,
            source: `alertmanager:${severity}`,
          },
        });
      } catch (logErr) {
        console.error('Failed to persist alert in database:', logErr);
      }
    }

    return NextResponse.json({ success: true, processedAlerts: alerts.length }, { status: 200 });
  } catch (err: any) {
    console.error('Error handling Alertmanager webhook:', err);
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 });
  }
}
