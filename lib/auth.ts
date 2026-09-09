import "dotenv/config";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendRegistrationEmail } from "./email-service";
import { SystemLogger } from "@/features/system/services/logger.service";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "exp://",
    "exp://*",
    "socialai://",
    "socialai://*",
    "http://192.168.*",
    "http://10.0.*",
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ].filter(Boolean),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [bearer()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────
  // Fire welcome email and initialize default Free Plan on registration
  // ─────────────────────────────────────────────────────────────────────
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 1. Send the welcome email
          try {
            await sendRegistrationEmail(user.email, user.name ?? undefined);
            console.log(`📧 Welcome email queued for ${user.email}`);
          } catch (err) {
            console.error(`❌ Failed to queue welcome email for ${user.email}:`, err);
            await SystemLogger.logError({
              message: "Failed to queue welcome email",
              source: "BetterAuth.UserCreate",
              context: { email: user.email, err: String(err) },
            });
          }

          // 2. Create default Organization, Business, and activate Free Plan Subscription
          try {
            const businessName = user.name ? `${user.name}'s Workspace` : 'My Workspace';
            const slug =
              businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
              '-' +
              Math.random().toString(36).substring(2, 8);
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            await prisma.organization.create({
              data: {
                name: businessName,
                slug,
                ownerId: user.id,
                members: {
                  create: {
                    userId: user.id,
                    role: 'OWNER',
                  },
                },
                subscriptions: {
                  create: {
                    planId: 'free',
                    status: 'ACTIVE',
                    startDate: now,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                    cancelAtPeriodEnd: false,
                    usage: {
                      create: [
                        { feature: 'AI_POSTS', used: 0, limit: 5, period: 'MONTHLY' },
                        { feature: 'AI_BLOG_ARTICLES', used: 0, limit: 20, period: 'MONTHLY' },
                      ],
                    },
                  },
                },
                businesses: {
                  create: {
                    name: businessName,
                    slug,
                    members: {
                      create: {
                        userId: user.id,
                        role: 'OWNER',
                      },
                    },
                  },
                },
              },
            });
            console.log(`🏢 Activated Free Plan Subscription and created default workspace for ${user.email}`);
          } catch (err) {
            console.error(`❌ Failed to initialize free subscription and workspace for ${user.email}:`, err);
            await SystemLogger.logError({
              message: "Failed to create default business and free subscription",
              source: "BetterAuth.UserCreate",
              context: { email: user.email, err: String(err) },
            });
          }

          // 3. Log Audit & Activity Events
          await SystemLogger.logAudit({
            action: "USER_SIGNUP",
            resource: "User",
            status: "SUCCESS",
            userId: user.id,
            details: { email: user.email, method: "credentials or oauth" },
          });

          await SystemLogger.logActivity({
            action: "ACCOUNT_CREATED",
            entity: "User",
            entityId: user.id,
            userId: user.id,
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Log user login activity
          await SystemLogger.logAudit({
            action: "USER_LOGIN",
            resource: "Session",
            status: "SUCCESS",
            userId: session.userId,
            ipAddress: session.ipAddress || undefined,
            userAgent: session.userAgent || undefined,
            details: { sessionId: session.id },
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;