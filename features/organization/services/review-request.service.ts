import prisma from '@/lib/prisma';
import { emailQueue } from '@/lib/emailQueue';
import { SystemLogger } from '@/features/system/services/logger.service';
import { sendSMS, isValidPhoneNumber, getSMSPriceEstimate } from '@/lib/twilio';

export interface ReviewRequestInput {
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  channel?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  message?: string; // Custom message to include
}

export interface ReviewRequestServiceResult {
  success: boolean;
  requestId: string;
  message: string;
}

/**
 * Send automated review request to customer
 */
export async function sendReviewRequest(data: ReviewRequestInput): Promise<ReviewRequestServiceResult> {
  const {
    businessId,
    customerName,
    customerEmail,
    customerPhone,
    channel = 'EMAIL',
    message
  } = data;

  try {
    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { profile: true }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Generate unique review link
    const reviewToken = await generateReviewToken(businessId, customerEmail);
    const reviewLink = `${process.env.BETTER_AUTH_URL}/reviews/submit?token=${reviewToken}`;

    // Create review request record
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        businessId,
        token: reviewToken,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        channel,
        status: 'PENDING'
      }
    });

    // Send via selected channel
    if (channel === 'EMAIL') {
      await sendReviewRequestEmail({
        to: customerEmail,
        customerName,
        businessName: business.name,
        reviewLink,
        customMessage: message
      });
    } else if (channel === 'SMS' && customerPhone) {
      await sendReviewRequestSMS({
        to: customerPhone,
        customerName,
        businessName: business.name,
        reviewLink,
        customMessage: message
      });
    }

    // Update status to SENT
    await prisma.reviewRequest.update({
      where: { id: reviewRequest.id },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return {
      success: true,
      requestId: reviewRequest.id,
      message: `Review request sent via ${channel}`
    };
  } catch (error: any) {
    console.error('Failed to send review request:', error);
    await SystemLogger.logError({
      message: error.message || 'Failed to send review request',
      source: 'ReviewRequestService.sendReviewRequest',
      context: { businessId: data.businessId, customerEmail: data.customerEmail }
    });
    return {
      success: false,
      requestId: '',
      message: error instanceof Error ? error.message : 'Failed to send review request'
    };
  }
}

/**
 * Send review request via email
 */
async function sendReviewRequestEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  reviewLink: string;
  customMessage?: string;
}) {
  const { to, customerName, businessName, reviewLink, customMessage } = params;

  const html = createReviewRequestEmailHTML({
    customerName,
    businessName,
    reviewLink,
    customMessage
  });

  // Add to email queue
  await emailQueue.add('send-email', {
    to,
    subject: `How was your experience at ${businessName}?`,
    html,
    type: 'review-request'
  });

  await SystemLogger.logActivity({
    action: 'REVIEW_REQUEST_SENT',
    entity: 'ReviewRequest',
    details: { to, businessName, channel: 'EMAIL' }
  });
}

/**
 * Create simple HTML email for review request
 */
function createReviewRequestEmailHTML(params: {
  customerName: string;
  businessName: string;
  reviewLink: string;
  customMessage?: string;
}): string {
  const { customerName, businessName, reviewLink, customMessage } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9fafb; border-radius: 12px; padding: 30px; text-align: center; }
    .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1a1a1a; }
    .message { font-size: 16px; margin-bottom: 30px; color: #555; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .stars { font-size: 32px; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 14px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Hi ${customerName}! 👋</div>

    ${customMessage ? `<div class="message">${customMessage}</div>` : ''}

    <div class="message">
      Thanks for visiting <strong>${businessName}</strong>! We hope you had a great experience.
      <br><br>
      Could you spare 60 seconds to leave us a quick review? It helps us serve you better and lets others know what to expect!
    </div>

    <div class="stars">⭐⭐⭐⭐⭐</div>

    <a href="${reviewLink}" class="button">Leave Your Review</a>

    <div class="footer">
      Thank you for your support!<br>
      The ${businessName} Team
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send review request via SMS with Twilio integration
 */
async function sendReviewRequestSMS(params: {
  to: string;
  customerName: string;
  businessName: string;
  reviewLink: string;
  customMessage?: string;
}) {
  const { to, customerName, businessName, reviewLink, customMessage } = params;

  try {
    // Validate phone number
    if (!isValidPhoneNumber(to)) {
      throw new Error(`Invalid phone number format: ${to}`);
    }

    // Create personalized message
    const defaultMessage = `Hi ${customerName}! Thanks for visiting ${businessName}. Love your experience? Leave us a quick review: ${reviewLink} Takes 60 seconds! ⭐⭐⭐⭐⭐`;
    const message = customMessage || defaultMessage;

    // Check message length and estimate cost
    const messageLength = message.length;
    const estimatedCost = getSMSPriceEstimate(messageLength);

    console.log(`Sending SMS to ${to}. Message length: ${messageLength} chars. Estimated cost: $${estimatedCost.toFixed(4)}`);

    // Send SMS using Twilio
    const smsResult = await sendSMS({
      to,
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    if (!smsResult.success) {
      throw new Error(smsResult.error || 'Failed to send SMS');
    }

    // Log successful SMS delivery
    await SystemLogger.logActivity({
      action: 'REVIEW_REQUEST_SENT',
      entity: 'ReviewRequest',
      details: {
        to,
        businessName,
        channel: 'SMS',
        messageSid: smsResult.sid,
        messageLength,
        estimatedCost
      }
    });

    console.log(`SMS sent successfully to ${to}. SID: ${smsResult.sid}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Failed to send SMS to ${to}:`, errorMessage);

    // Log the error
    await SystemLogger.logError({
      message: errorMessage,
      source: 'ReviewRequestService.sendReviewRequestSMS',
      context: { to, businessName, customerName }
    });

    // Re-throw the error to be handled by the calling function
    throw new Error(`SMS delivery failed: ${errorMessage}`);
  }
}

/**
 * Generate unique review token
 */
async function generateReviewToken(businessId: string, customerEmail: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.default
    .createHash('sha256')
    .update(`${businessId}-${customerEmail}-${Date.now()}`)
    .digest('hex');
}

/**
 * Bulk send review requests (for CSV import, etc.)
 */
export async function bulkSendReviewRequests(requests: ReviewRequestInput[]) {
  const results = [];

  for (const request of requests) {
    const result = await sendReviewRequest(request);
    results.push(result);

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Send follow-up reminder for a pending review request
 */
export async function sendFollowUp(requestId: string): Promise<ReviewRequestServiceResult> {
  try {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        business: {
          include: { profile: true }
        }
      }
    });

    if (!reviewRequest) {
      throw new Error('Review request not found');
    }

    if (reviewRequest.status === 'SUBMITTED') {
      return {
        success: false,
        requestId,
        message: 'Review already submitted'
      };
    }

    const reviewLink = `${process.env.BETTER_AUTH_URL}/reviews/submit?token=${reviewRequest.token}`;

    // Send follow-up email
    await emailQueue.add('send-email', {
      to: reviewRequest.customerEmail,
      subject: `Friendly reminder: We value your feedback on ${reviewRequest.business.name}`,
      html: createFollowUpEmailHTML({
        customerName: reviewRequest.customerName,
        businessName: reviewRequest.business.name,
        reviewLink
      }),
      type: 'review-follow-up'
    });

    // Update follow-up count or status if needed
    await prisma.reviewRequest.update({
      where: { id: requestId },
      data: {
        status: 'SENT', // Keep as SENT or add a FOLLOW_UP_SENT status if schema allows
        sentAt: new Date() // Update sent time
      }
    });

    await SystemLogger.logActivity({
      action: 'REVIEW_FOLLOW_UP_SENT',
      entity: 'ReviewRequest',
      entityId: requestId,
      details: { businessId: reviewRequest.businessId, customerEmail: reviewRequest.customerEmail }
    });

    return {
      success: true,
      requestId,
      message: 'Follow-up sent successfully'
    };
  } catch (error: any) {
    console.error('Failed to send follow-up:', error);
    await SystemLogger.logError({
      message: error.message || 'Failed to send follow-up',
      source: 'ReviewRequestService.sendFollowUp',
      context: { requestId }
    });
    return {
      success: false,
      requestId,
      message: error instanceof Error ? error.message : 'Failed to send follow-up'
    };
  }
}

/**
 * Create follow-up email HTML
 */
function createFollowUpEmailHTML(params: {
  customerName: string;
  businessName: string;
  reviewLink: string;
}): string {
  const { customerName, businessName, reviewLink } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center; }
    .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    .button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Hi ${customerName}, just a quick check-in! 😊</div>
    <p>We're still eager to hear about your recent experience at <strong>${businessName}</strong>.</p>
    <p>If you have a moment, we'd really appreciate it if you could share your thoughts. It only takes a minute!</p>
    <a href="${reviewLink}" class="button">Leave a Review</a>
    <p style="font-size: 14px; color: #6b7280;">If you've already left a review, please ignore this message. Thank you!</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Bulk send follow-ups for requests older than X days
 */
export async function bulkSendFollowUps(businessId: string, daysAgo: number = 3) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);

  const pendingRequests = await prisma.reviewRequest.findMany({
    where: {
      businessId,
      status: 'SENT',
      sentAt: {
        lte: targetDate
      }
    }
  });

  const results = [];
  for (const request of pendingRequests) {
    const result = await sendFollowUp(request.id);
    results.push(result);
  }

  return results;
}

/**
 * Get review request statistics
 */
export async function getReviewRequestStats(businessId: string) {
  const stats = await prisma.reviewRequest.groupBy({
    by: ['status'],
    where: { businessId },
    _count: true
  });

  const total = await prisma.reviewRequest.count({
    where: { businessId }
  });

  const conversionRate = total > 0
    ? (stats.find(s => s.status === 'SUBMITTED')?._count || 0) / total * 100
    : 0;

  return {
    total,
    byStatus: stats,
    conversionRate: conversionRate.toFixed(1) + '%'
  };
}
