import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * GET /api/billing/invoices?businessId=xyz
 * Returns past invoices and payment receipts from Stripe for the active workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId =
      searchParams.get('businessId') ||
      req.headers.get('x-business-id');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    const customerId = business?.organization?.subscriptions?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ invoices: [] }, { status: 200 });
    }

    const stripe = BillingService.getStripe();
    const stripeInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 24,
    });

    const invoices = stripeInvoices.data.map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: new Date(inv.created * 1000).toISOString(),
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices', message: error?.message },
      { status: 500 }
    );
  }
}
