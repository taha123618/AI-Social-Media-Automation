/**
 * Centralized Configuration for Plans, Feature Entitlements, and Hierarchy
 * Single source of truth for backend guards, frontend gates, and Stripe mapping.
 */

export type FeatureKey =
  | 'ai_posts'
  | 'ai_articles'
  | 'article_word_limit'
  | 'brand_voice_profiles'
  | 'seo_scoring'
  | 'topical_cluster_mapping'
  | 'topical_cluster_strategy'
  | 'auto_internal_linking'
  | 'gsc_sync'
  | 'ai_detection_bypass'
  | 'scheduling'
  | 'cms_publishing'
  | 'advanced_analytics'
  | 'team_collaboration'
  | 'white_label_reports'
  | 'api_access'
  | 'custom_model_finetuning';

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanFeatureConfig {
  ai_posts: number; // -1 for unlimited
  ai_articles: number; // -1 for unlimited
  article_word_limit: number; // -1 for unlimited
  brand_voice_profiles: number; // -1 for unlimited
  seo_scoring: boolean;
  topical_cluster_mapping: boolean;
  topical_cluster_strategy: boolean;
  auto_internal_linking: boolean;
  gsc_sync: boolean;
  ai_detection_bypass: boolean;
  scheduling: boolean;
  cms_publishing: 'none' | 'basic' | 'all';
  advanced_analytics: boolean;
  team_collaboration: boolean;
  white_label_reports: boolean;
  api_access: boolean;
  custom_model_finetuning: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  tier: number; // 0 = free, 1 = starter, 2 = pro, 3 = enterprise
  pricing: {
    monthly: number; // in cents
    annual: number; // in cents per month (billed annually)
    stripeMonthlyPriceId?: string;
    stripeAnnualPriceId?: string;
  };
  features: PlanFeatureConfig;
  highlights: string[];
}

export const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Essential AI creation tools for solo creators and freelancers.',
    tier: 0,
    pricing: {
      monthly: 0,
      annual: 0,
    },
    features: {
      ai_posts: 5,
      ai_articles: 20,
      article_word_limit: 3000,
      brand_voice_profiles: 1,
      seo_scoring: true,
      topical_cluster_mapping: false,
      topical_cluster_strategy: false,
      auto_internal_linking: false,
      gsc_sync: false,
      ai_detection_bypass: false,
      scheduling: false,
      cms_publishing: 'basic', // WordPress & Ghost export
      advanced_analytics: false,
      team_collaboration: false,
      white_label_reports: false,
      api_access: false,
      custom_model_finetuning: false,
    },
    highlights: [
      '5 AI social posts / month',
      '20 AI blog articles / month',
      'Up to 3,000 words / article',
      '1 Brand Voice profile',
      'Real-time SEO scoring',
      'WordPress & Ghost export',
      'Basic analytics & standard support',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'High-velocity growth engine for growing creators and startups.',
    tier: 1,
    pricing: {
      monthly: 2900, // $29.00
      annual: 2400, // $24.00/mo billed annually
      stripeMonthlyPriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
      stripeAnnualPriceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_starter_annual',
    },
    features: {
      ai_posts: 50,
      ai_articles: 100,
      article_word_limit: 8000,
      brand_voice_profiles: 5,
      seo_scoring: true,
      topical_cluster_mapping: true,
      topical_cluster_strategy: false,
      auto_internal_linking: true,
      gsc_sync: true,
      ai_detection_bypass: true,
      scheduling: true,
      cms_publishing: 'all',
      advanced_analytics: true,
      team_collaboration: false,
      white_label_reports: false,
      api_access: false,
      custom_model_finetuning: false,
    },
    highlights: [
      '50 AI social posts / month',
      '100 AI blog articles / month',
      'Up to 8,000 words / article',
      '5 Brand Voice profiles',
      'All social platforms & scheduling',
      'Topical cluster mapping & auto-internal linking',
      'Google Search Console synchronization',
      'AI detection bypass engine',
      '1-Click CMS publishing (Webflow, Shopify, Medium, etc.)',
      'Advanced analytics & priority support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited AI capabilities, white-label reporting, and API access for agencies and scaling teams.',
    tier: 2,
    pricing: {
      monthly: 9900, // $99.00
      annual: 7900, // $79.00/mo billed annually
      stripeMonthlyPriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
    },
    features: {
      ai_posts: -1, // Unlimited
      ai_articles: -1, // Unlimited
      article_word_limit: -1, // Unlimited
      brand_voice_profiles: -1, // Unlimited
      seo_scoring: true,
      topical_cluster_mapping: true,
      topical_cluster_strategy: true,
      auto_internal_linking: true,
      gsc_sync: true,
      ai_detection_bypass: true,
      scheduling: true,
      cms_publishing: 'all',
      advanced_analytics: true,
      team_collaboration: true,
      white_label_reports: true,
      api_access: true,
      custom_model_finetuning: true,
    },
    highlights: [
      'Unlimited AI social posts',
      'Unlimited AI blog articles (no word limits)',
      'Unlimited Brand Voice profiles & custom AI voice training',
      'Team collaboration & seat-based RBAC',
      'White-label reports & custom branded exports',
      'Full REST & Developer API access',
      'Topical cluster strategy & full SEO suite',
      'Custom AI model fine-tuning',
      'Dedicated Customer Success Manager + SLA',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom infrastructure, dedicated compute, and custom SLA for large enterprises.',
    tier: 3,
    pricing: {
      monthly: 29900,
      annual: 24900,
    },
    features: {
      ai_posts: -1,
      ai_articles: -1,
      article_word_limit: -1,
      brand_voice_profiles: -1,
      seo_scoring: true,
      topical_cluster_mapping: true,
      topical_cluster_strategy: true,
      auto_internal_linking: true,
      gsc_sync: true,
      ai_detection_bypass: true,
      scheduling: true,
      cms_publishing: 'all',
      advanced_analytics: true,
      team_collaboration: true,
      white_label_reports: true,
      api_access: true,
      custom_model_finetuning: true,
    },
    highlights: [
      'Everything in Pro with dedicated infrastructure',
      'Custom LLM fine-tuning & vector indexing pipelines',
      'Custom contract & invoicing billing',
      '99.99% Uptime SLA',
    ],
  },
};
