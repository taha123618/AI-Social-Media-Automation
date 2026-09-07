import 'dotenv/config';
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // Core App & Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database Connection
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication & Security Secrets
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be provided'),
  BETTER_AUTH_URL: z.string().url().optional(),
  ADMIN_JWT_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Redis & BullMQ Message Broker
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // AI Model Providers
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Cloud Object Storage (S3 / R2)
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),

  // Stripe & Subscriptions
  BILLING_ENABLED: z.string().optional().default('false'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export function validateEnvironment() {
  console.log('🔍 Validating application environment variables...');
  const parsed = EnvironmentSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ FATAL: Invalid or missing required environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  const env = parsed.data;
  const isProd = env.NODE_ENV === 'production';
  const warnings: string[] = [];

  // Production security checks
  if (isProd) {
    if (env.BETTER_AUTH_SECRET.length < 32) {
      warnings.push('BETTER_AUTH_SECRET is shorter than 32 characters in production.');
    }
    if (!env.ADMIN_JWT_SECRET) {
      warnings.push('ADMIN_JWT_SECRET is not configured for production admin operations.');
    }
    if (!env.CRON_SECRET) {
      warnings.push('CRON_SECRET is not set. Scheduled cron endpoints may be unprotected.');
    }
  }

  // AI Provider check
  if (!env.OPENAI_API_KEY && !env.OPENROUTER_API_KEY) {
    warnings.push('Neither OPENAI_API_KEY nor OPENROUTER_API_KEY is configured. AI generation will fall back or fail.');
  }

  // S3 Storage parity check
  const s3Keys = [env.AWS_ACCESS_KEY_ID, env.AWS_SECRET_ACCESS_KEY, env.AWS_BUCKET_NAME];
  const s3KeyCount = s3Keys.filter(Boolean).length;
  if (s3KeyCount > 0 && s3KeyCount < 3) {
    warnings.push('Partial AWS S3 configuration detected. Media uploads will fall back to local database storage.');
  }

  // Billing check
  if (env.BILLING_ENABLED === 'true' && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) {
    warnings.push('BILLING_ENABLED is true but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  console.log(`✅ Environment configuration validated successfully (${env.NODE_ENV} mode).`);
  return env;
}

// Execute check if run directly via CLI
if (process.argv[1]?.includes('validate-env')) {
  validateEnvironment();
}

