import { z } from 'zod';

const EnvironmentSchema = z.object({
  // Core App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth & Security
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // Redis / BullMQ
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),

  // AI & Storage (Optional at boot, warned if missing)
  OPENAI_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
});

export function validateEnvironment() {
  const parsed = EnvironmentSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ FATAL: Invalid or missing required environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  console.log('✅ Environment configuration validated successfully.');
  return parsed.data;
}

// Execute check if run directly via CLI
if (process.argv[1]?.includes('validate-env')) {
  validateEnvironment();
}
