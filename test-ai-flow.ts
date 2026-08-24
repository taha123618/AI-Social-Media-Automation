import 'dotenv/config';
import prisma from './lib/prisma';
import { generateReviewResponse } from './features/organization/services/review-response-generator.service';
import { convertReviewToPostDraft } from './features/organization/services/review-to-post-converter.service';

async function run() {
  try {
    const business = await prisma.business.findFirst({
      include: { members: true, profile: true }
    });

    if (!business) {
      console.log("No business found");
      return;
    }
    console.log("Found business:", business.name);

    // 1. Create a 5-star review
    const review = await prisma.review.create({
      data: {
        businessId: business.id,
        rating: 5,
        reviewText: "This AI automation tool completely changed how we handle social media. 10/10 incredible!",
        reviewerName: "Test Customer",
        source: "DIRECT",
        sentiment: "POSITIVE",
        reviewDate: new Date()
      }
    });
    console.log("Created 5-star review:", review.id);

    // 2. Generate AI Response
    console.log("\nGenerating AI Response...");
    const response = await generateReviewResponse({ reviewId: review.id, businessId: business.id });

    await prisma.review.update({
      where: { id: review.id },
      data: { responseText: response.responseText, respondedAt: new Date() }
    });
    console.log("Generated AI Response:", response.responseText);

    // 3. Convert to Post
    console.log("\nConverting 5-star review to social post...");
    const post = await convertReviewToPostDraft({
      reviewId: review.id,
      businessId: business.id,
      creatorId: business.members[0]?.userId,
      platforms: ['INSTAGRAM', 'FACEBOOK']
    });

    console.log("Converted to Social Post. Fields:", JSON.stringify(post, null, 2));

    // 4. Check Dashboard Recent Drafts
    console.log("\nChecking Dashboard Recent Drafts...");
    const drafts = await prisma.contentDraft.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    if (drafts.length > 0) {
      console.log("Found Recent Draft:", drafts[0].id);
      console.log("Draft visual prompt:", drafts[0].visualPrompt);
      console.log("SUCCESS: End-to-End AI Flow works perfectly.");
    } else {
      console.log("ERROR: Draft was not created.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    const p = prisma as any;
    if (p.$disconnect) await p.$disconnect();
  }
}

run();
