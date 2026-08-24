/**
 * Industry-specific caption templates for local businesses
 * These templates are designed to convert engagement into leads and sales
 */

export interface CaptionTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  bestFor: string[]; // e.g., ['before-after', 'job-photo', 'product']
  platforms: string[]; // e.g., ['INSTAGRAM', 'FACEBOOK']
  tone?: string;
}

// Restaurant & Food Service Templates
export const restaurantTemplates: CaptionTemplate[] = [
  {
    id: 'rest-before-after',
    name: 'Before & After Transformation',
    template: '🔥 From [before_state] to [after_state]! Watch the magic happen ✨\n\nOur [chef/team] crafted this [dish_name] with [key_ingredient] and love. Every bite tells a story of quality and passion.\n\n📍 Visit us at [location]\n⏰ Open [hours]\n📞 Order now: [phone]\n\n[cta]',
    variables: ['before_state', 'after_state', 'dish_name', 'key_ingredient', 'location', 'hours', 'phone', 'cta'],
    bestFor: ['before-after', 'cooking-process'],
    platforms: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK']
  },
  {
    id: 'rest-special-offer',
    template: '⚡ LIMITED TIME OFFER! ⚡\n\n[offer_details] - Perfect for [occasion]!\n\nTag someone who needs to try this 👇\n\n🗓️ Valid: [valid_dates]\n💳 [payment_info]\n\n[cta]',
    name: 'Special Promotion',
    variables: ['offer_details', 'occasion', 'valid_dates', 'payment_info', 'cta'],
    bestFor: ['promotion', 'special-event'],
    platforms: ['INSTAGRAM', 'FACEBOOK']
  },
  {
    id: 'rest-customer-favorite',
    template: '⭐ CUSTOMER FAVORITE ALERT! ⭐\n\n"[customer_quote]" - [customer_name]\n\nSee why everyone\'s obsessed with our [item_name]! Made fresh daily with [unique_selling_point].\n\nCome taste the difference! 🍽️\n\n[cta]',
    name: 'Customer Testimonial',
    variables: ['customer_quote', 'customer_name', 'item_name', 'unique_selling_point', 'cta'],
    bestFor: ['testimonial', 'review-highlight'],
    platforms: ['INSTAGRAM', 'FACEBOOK', 'GOOGLE_BUSINESS']
  }
];

// Salon & Beauty Templates
export const salonTemplates: CaptionTemplate[] = [
  {
    id: 'salon-transformation',
    name: 'Transformation Tuesday',
    template: '✨ GLOW UP ALERT! ✨\n\nFrom [before_description] to [after_description]! Our expert stylist [stylist_name] worked their magic using [products_used].\n\nReady for your transformation? 💫\n\n📱 Book now: [booking_link]\n📍 [location]\n\n[cta]',
    variables: ['before_description', 'after_description', 'stylist_name', 'products_used', 'booking_link', 'location', 'cta'],
    bestFor: ['before-after', 'transformation'],
    platforms: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK']
  },
  {
    id: 'salon-service-spotlight',
    name: 'Service Spotlight',
    template: '💆‍♀️ SERVICE SPOTLIGHT: [service_name]\n\nTreat yourself to [service_benefits]! Perfect for [target_audience].\n\n✨ Includes: [service_details]\n⏱️ Duration: [duration]\n💰 Price: [price]\n\nYou deserve this! 💕\n\n[cta]',
    variables: ['service_name', 'service_benefits', 'target_audience', 'service_details', 'duration', 'price', 'cta'],
    bestFor: ['service-promotion', 'education'],
    platforms: ['INSTAGRAM', 'FACEBOOK']
  }
];

// Contractor & Home Services Templates
export const contractorTemplates: CaptionTemplate[] = [
  {
    id: 'contractor-project-complete',
    name: 'Project Completion',
    template: '✅ ANOTHER PROJECT COMPLETE! ✅\n\nJust wrapped up this [project_type] in [location]! From start to finish, we delivered:\n✓ [feature_1]\n✓ [feature_2]\n✓ [feature_3]\n\nQuality workmanship guaranteed! 🔨\n\n📞 Get your free estimate: [phone]\n🌐 [website]\n\n[cta]',
    variables: ['project_type', 'location', 'feature_1', 'feature_2', 'feature_3', 'phone', 'website', 'cta'],
    bestFor: ['job-photo', 'project-showcase'],
    platforms: ['FACEBOOK', 'LINKEDIN', 'GOOGLE_BUSINESS']
  },
  {
    id: 'contractor-problem-solution',
    name: 'Problem → Solution',
    template: '🚫 TIRED OF [problem]?\n\nWe have the solution! Our team specializes in [solution] with [years_experience] years of experience.\n\n💡 Why choose us?\n✓ Licensed & insured\n✓ Free estimates\n✓ [unique_advantage]\n\nTrusted by [number]+ happy customers!\n\n[cta]',
    variables: ['problem', 'solution', 'years_experience', 'unique_advantage', 'number', 'cta'],
    bestFor: ['educational', 'lead-generation'],
    platforms: ['FACEBOOK', 'LINKEDIN']
  }
];

// Retail Templates
export const retailTemplates: CaptionTemplate[] = [
  {
    id: 'retail-new-arrival',
    name: 'New Arrival Announcement',
    template: '🛍️ JUST IN! [product_name] has arrived! ✨\n\nPerfect for [use_case/occasion]. Features:\n• [feature_1]\n• [feature_2]\n• [feature_3]\n\n💰 [price]\n📦 [shipping_info]\n\nAvailable in-store & online!\n\n[cta]',
    variables: ['product_name', 'use_case', 'feature_1', 'feature_2', 'feature_3', 'price', 'shipping_info', 'cta'],
    bestFor: ['product-launch', 'new-inventory'],
    platforms: ['INSTAGRAM', 'FACEBOOK', 'PINTEREST']
  },
  {
    id: 'retail-customer-review',
    name: 'Customer Review Highlight',
    template: '⭐⭐⭐⭐⭐ "5-star review text here"\n- [customer_name], verified buyer\n\nThank you for the love! 💕 Join [number]+ satisfied customers who trust [business_name].\n\nShop now 👉 [link]\n\n[cta]',
    variables: ['review_text', 'customer_name', 'number', 'business_name', 'link', 'cta'],
    bestFor: ['testimonial', 'social-proof'],
    platforms: ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN']
  }
];

// Health & Fitness Templates
export const fitnessTemplates: CaptionTemplate[] = [
  {
    id: 'fitness-transformation',
    name: 'Member Transformation',
    template: '🎉 TRANSFORMATION TUESDAY! 🎉\n\nMeet [member_name]! In [timeframe] they\'ve:\n📈 [achievement_1]\n📈 [achievement_2]\n📈 [achievement_3]\n\n"I never thought I could [accomplishment]. This community changed my life!" - [member_name]\n\nYour journey starts here! 💪\n\n[cta]',
    variables: ['member_name', 'timeframe', 'achievement_1', 'achievement_2', 'achievement_3', 'accomplishment', 'cta'],
    bestFor: ['transformation', 'testimonial'],
    platforms: ['INSTAGRAM', 'FACEBOOK']
  },
  {
    id: 'fitness-class-promo',
    name: 'Class Promotion',
    template: '🔥 NEW CLASS ALERT: [class_name]! 🔥\n\nGet ready for [class_description] that will help you [benefit_1] and [benefit_2]!\n\n📅 When: [schedule]\n👤 Instructor: [instructor_name]\n💪 Level: [difficulty]\n\nFirst class FREE! 🎁\n\n[cta]',
    variables: ['class_name', 'class_description', 'benefit_1', 'benefit_2', 'schedule', 'instructor_name', 'difficulty', 'cta'],
    bestFor: ['class-launch', 'event-promotion'],
    platforms: ['INSTAGRAM', 'FACEBOOK']
  }
];

// Professional Services Templates (Legal, Financial, Real Estate)
export const professionalTemplates: CaptionTemplate[] = [
  {
    id: 'pro-market-update',
    name: 'Market Update/Insight',
    template: '📊 MARKET UPDATE: [month/year]\n\nKey insights for [location/industry]:\n\n📈 [stat_1]\n📊 [stat_2]\n💡 [stat_3]\n\nWhat does this mean for you? [interpretation]\n\nThinking about [action]? Now\'s the time to talk to an expert.\n\n📞 Free consultation: [phone]\n\n[cta]',
    variables: ['month', 'location', 'stat_1', 'stat_2', 'stat_3', 'interpretation', 'action', 'phone', 'cta'],
    bestFor: ['educational', 'market-analysis'],
    platforms: ['LINKEDIN', 'FACEBOOK']
  },
  {
    id: 'pro-success-story',
    name: 'Client Success Story',
    template: '🏆 CLIENT SUCCESS STORY 🏆\n\nWe recently helped [client_type] achieve [result] in [timeframe]!\n\nThe challenge: [challenge]\nOur solution: [solution]\nThe result: [quantifiable_result]\n\nReady for similar results? Let\'s talk!\n\n[cta]',
    variables: ['client_type', 'result', 'timeframe', 'challenge', 'solution', 'quantifiable_result', 'cta'],
    bestFor: ['case-study', 'success-story'],
    platforms: ['LINKEDIN', 'FACEBOOK']
  }
];

// Helper function to get templates by industry
export function getTemplatesByIndustry(industry: string): CaptionTemplate[] {
  const templateMap: Record<string, CaptionTemplate[]> = {
    RESTAURANT: restaurantTemplates,
    SALON: salonTemplates,
    BEAUTY_COSMETICS: salonTemplates,
    CONTRACTOR: contractorTemplates,
    HOME_SERVICES: contractorTemplates,
    AUTO_REPAIR: contractorTemplates,
    RETAIL: retailTemplates,
    HEALTH_FITNESS: fitnessTemplates,
    REAL_ESTATE: professionalTemplates,
    LEGAL_FINANCIAL: professionalTemplates,
    MEDICAL_DENTAL: professionalTemplates,
  };

  return templateMap[industry] || [];
}

// Helper function to fill template variables
export function fillTemplate(template: CaptionTemplate, values: Record<string, string>): string {
  let caption = template.template;

  Object.entries(values).forEach(([key, value]) => {
    caption = caption.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
  });

  // Remove any unfilled variables
  caption = caption.replace(/\[[^\]]+\]/g, '');

  return caption.trim();
}
