import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { sendRegistrationEmail } from "./email-service";
import { SystemLogger } from "@/features/system/services/logger.service";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async hashPassword(password: string) {
      return await bcrypt.hash(password, 12);
    },
    async verifyPassword(password: string, hash: string) {
      return await bcrypt.compare(password, hash);
    },
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
  // Fire welcome email for EVERY new user regardless of signup method
  // (email/password form, Google OAuth, etc.)
  // ─────────────────────────────────────────────────────────────────────
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 1. Send the welcome email (doesn't block account creation if it fails)
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

          // 2. Create a default business for the new user, so pages like /knowledge
          //    and /analytics don't crash with "Business not found".
          try {
            const businessName = user.name ? `${user.name}'s Business` : 'My Business';
            const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);

            await prisma.business.create({
              data: {
                name: businessName,
                slug,
                members: {
                  create: {
                    userId: user.id,
                    role: 'OWNER',
                  }
                }
              }
            });
            console.log(`🏢 Created default business for ${user.email}`);
          } catch (err) {
            console.error(`❌ Failed to create default business for ${user.email}:`, err);
            await SystemLogger.logError({
              message: "Failed to create default business",
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