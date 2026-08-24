import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReviewSource, ReviewRequestStatus, Sentiment } from '@/app/generated/prisma/enums';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, rating, reviewText } = body;

    if (!token || !rating) {
      return NextResponse.json({ error: 'Token and rating are required' }, { status: 400 });
    }

    // Find the review request
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { token },
      include: { business: true }
    });

    if (!reviewRequest) {
      return NextResponse.json({ error: 'Invalid or expired review link' }, { status: 404 });
    }

    if (reviewRequest.status === 'SUBMITTED') {
      return NextResponse.json({ error: 'Review has already been submitted' }, { status: 400 });
    }

    // Determine sentiment (simplified)
    let sentiment: Sentiment = Sentiment.NEUTRAL;
    if (rating >= 5) sentiment = Sentiment.VERY_POSITIVE;
    else if (rating >= 4) sentiment = Sentiment.POSITIVE;
    else if (rating === 3) sentiment = Sentiment.NEUTRAL;
    else if (rating === 2) sentiment = Sentiment.NEGATIVE;
    else sentiment = Sentiment.VERY_NEGATIVE;

    // Create the review
    const review = await prisma.review.create({
      data: {
        businessId: reviewRequest.businessId,
        source: ReviewSource.DIRECT,
        reviewerName: reviewRequest.customerName,
        reviewerEmail: reviewRequest.customerEmail,
        rating: parseInt(rating),
        reviewText,
        reviewDate: new Date(),
        sentiment,
        isVerified: true
      }
    });

    // Update review request
    await prisma.reviewRequest.update({
      where: { id: reviewRequest.id },
      data: {
        status: ReviewRequestStatus.SUBMITTED,
        submittedAt: new Date(),
        reviewId: review.id,
        rating: parseInt(rating)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your review!',
      reviewId: review.id
    });

  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const reviewRequest = await prisma.reviewRequest.findUnique({
    where: { token },
    select: {
      customerName: true,
      status: true,
      business: {
        select: {
          name: true
        }
      }
    }
  });

  if (!reviewRequest) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: reviewRequest
  });
}
