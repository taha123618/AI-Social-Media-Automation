import prisma from "./prisma";
import redis from "./redis";
import { verifyAdminToken } from "./admin-auth";
import { SystemLogger } from "@/features/system/services/logger.service";

export interface MaintenanceConfigData {
  isEnabled: boolean;
  message: string;
  estimatedCompletion: string | null; // ISO string or date
  allowlistIps: string[];
  allowlistEmails: string[];
  apiBlocked: boolean;
  updatedAt?: string;
  updatedBy?: string | null;
}

const REDIS_KEY = "system:maintenance_config";

export class MaintenanceService {
  /**
   * Get the active maintenance configuration.
   * Attempts to retrieve from Redis first, falling back to PostgreSQL if not found or if Redis fails.
   */
  static async getConfig(): Promise<MaintenanceConfigData> {
    // 1. Try Redis cache
    try {
      const cached = await redis.get(REDIS_KEY);
      if (cached) {
        return JSON.parse(cached) as MaintenanceConfigData;
      }
    } catch (err) {
      console.error("[MaintenanceService] Redis read error:", err);
      // Fail silently and fallback to DB
    }

    // 2. Fallback to Database
    try {
      let config = await prisma.maintenanceConfig.findUnique({
        where: { id: "default" },
      });

      if (!config) {
        // Initialize default configuration
        config = await prisma.maintenanceConfig.create({
          data: {
            id: "default",
            isEnabled: false,
            message: "We are currently undergoing scheduled maintenance. Please check back soon.",
            apiBlocked: true,
            allowlistIps: [],
            allowlistEmails: [],
          },
        });
      }

      const configData: MaintenanceConfigData = {
        isEnabled: config.isEnabled,
        message: config.message,
        estimatedCompletion: config.estimatedCompletion ? config.estimatedCompletion.toISOString() : null,
        allowlistIps: config.allowlistIps,
        allowlistEmails: config.allowlistEmails,
        apiBlocked: config.apiBlocked,
        updatedAt: config.updatedAt.toISOString(),
        updatedBy: config.updatedBy,
      };

      // Write back to Redis cache
      try {
        await redis.set(REDIS_KEY, JSON.stringify(configData), {
          EX: 300, // 5 minutes TTL to prevent stale values if direct DB edits happen
        });
      } catch (err) {
        console.error("[MaintenanceService] Redis write error:", err);
      }

      return configData;
    } catch (err) {
      console.error("[MaintenanceService] Database read error:", err);
      // Safe fallback if database is also down
      return {
        isEnabled: false,
        message: "System is undergoing maintenance.",
        estimatedCompletion: null,
        allowlistIps: [],
        allowlistEmails: [],
        apiBlocked: true,
      };
    }
  }

  /**
   * Update the maintenance configuration.
   * Persists to PostgreSQL, updates Redis, and logs the administrative audit event.
   */
  static async updateConfig(
    data: Partial<MaintenanceConfigData>,
    adminEmail: string,
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<MaintenanceConfigData> {
    const updated = await prisma.maintenanceConfig.upsert({
      where: { id: "default" },
      update: {
        isEnabled: data.isEnabled,
        message: data.message,
        estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
        allowlistIps: data.allowlistIps,
        allowlistEmails: data.allowlistEmails,
        apiBlocked: data.apiBlocked,
        updatedBy: adminEmail,
      },
      create: {
        id: "default",
        isEnabled: data.isEnabled ?? false,
        message: data.message ?? "We are currently undergoing scheduled maintenance. Please check back soon.",
        estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
        allowlistIps: data.allowlistIps ?? [],
        allowlistEmails: data.allowlistEmails ?? [],
        apiBlocked: data.apiBlocked ?? true,
        updatedBy: adminEmail,
      },
    });

    const configData: MaintenanceConfigData = {
      isEnabled: updated.isEnabled,
      message: updated.message,
      estimatedCompletion: updated.estimatedCompletion ? updated.estimatedCompletion.toISOString() : null,
      allowlistIps: updated.allowlistIps,
      allowlistEmails: updated.allowlistEmails,
      apiBlocked: updated.apiBlocked,
      updatedAt: updated.updatedAt.toISOString(),
      updatedBy: updated.updatedBy,
    };

    // Update Redis cache immediately
    try {
      await redis.set(REDIS_KEY, JSON.stringify(configData), {
        EX: 300,
      });
    } catch (err) {
      console.error("[MaintenanceService] Redis update error:", err);
    }

    // Log administrative action
    await SystemLogger.logAudit({
      action: "MAINTENANCE_MODE_UPDATE",
      resource: "MaintenanceConfig",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      details: {
        isEnabled: configData.isEnabled,
        message: configData.message,
        estimatedCompletion: configData.estimatedCompletion,
        allowlistIps: configData.allowlistIps,
        allowlistEmails: configData.allowlistEmails,
        apiBlocked: configData.apiBlocked,
        updatedBy: adminEmail,
      },
    });

    return configData;
  }

  /**
   * Automatically disable maintenance mode when the estimatedCompletion timer
   * has expired. Called fire-and-forget from the status API so it doesn't block
   * the response. Writes directly to DB and then invalidates the Redis key.
   */
  static async autoDisable(): Promise<void> {
    await prisma.maintenanceConfig.update({
      where: { id: "default" },
      data: {
        isEnabled: false,
        estimatedCompletion: null,
        updatedBy: "system:auto-expiry",
      },
    });

    // Invalidate Redis so the next status check reads the fresh DB value
    try {
      await redis.del(REDIS_KEY);
    } catch (err) {
      console.error("[MaintenanceService] Redis invalidation error on auto-disable:", err);
    }

    console.log("[MaintenanceService] Maintenance mode auto-disabled (timer expired).");
  }

  /**
   * Helper to parse client IP address from request headers.
   */
  static getClientIp(headers: Headers): string {
    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headers.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
    return "127.0.0.1";
  }

  /**
   * Validates if the current request is bypassed based on:
   * 1. Admin JWT token verification
   * 2. Allowed developer IP address
   * 3. Allowed developer email address
   */
  static async checkBypass(params: {
    adminToken?: string;
    clientIp: string;
    userEmail?: string;
    config: MaintenanceConfigData;
  }): Promise<boolean> {
    const { adminToken, clientIp, userEmail, config } = params;

    // 1. Bypass if the user is verified as an administrator via the custom admin token cookie
    if (adminToken) {
      const adminSession = await verifyAdminToken(adminToken);
      if (adminSession) {
        return true;
      }
    }

    // 2. Bypass if client IP is present in the allowlist
    if (config.allowlistIps && config.allowlistIps.length > 0) {
      // Direct match
      if (config.allowlistIps.includes(clientIp)) {
        return true;
      }

      // Handle localhost mapping (::1, 127.0.0.1, ::ffff:127.0.0.1)
      if (clientIp === "::1" || clientIp === "127.0.0.1" || clientIp.includes("127.0.0.1")) {
        if (
          config.allowlistIps.includes("127.0.0.1") ||
          config.allowlistIps.includes("::1") ||
          config.allowlistIps.includes("localhost")
        ) {
          return true;
        }
      }
    }

    // 3. Bypass if logged-in user email is in the allowlist
    if (userEmail && config.allowlistEmails && config.allowlistEmails.length > 0) {
      if (config.allowlistEmails.includes(userEmail)) {
        return true;
      }
    }

    return false;
  }
}
