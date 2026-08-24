import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/features/billing/services/webhook.service';

/**
 * POST /api/billing/webhooks
 * Secure Stripe Webhook intake endpoint with signature verification and idempotent processing.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = WebhookService.constructEvent(rawBody, signature);

    const result = await WebhookService.processEvent(event);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK ERROR]', err?.message);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: err?.message },
      { status: 400 }
    );
  }
}
