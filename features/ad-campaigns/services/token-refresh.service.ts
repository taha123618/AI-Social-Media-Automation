import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export class TokenRefreshService {
  static async refreshMetaToken(credentialId: string): Promise<boolean> {
    const cred = await prisma.platformCredential.findUnique({ where: { id: credentialId } });
    if (!cred || cred.platform !== 'META') return false;

    try {
      const res = await fetch(
        `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${cred.accessToken}`,
      );
      const json = await res.json();
      if (!json.access_token) return false;

      const expiresAt = json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000)
        : undefined;

      await prisma.platformCredential.update({
        where: { id: credentialId },
        data: {
          accessToken: json.access_token,
          expiresAt,
          meta: { ...(cred.meta as any), lastRefreshedAt: new Date().toISOString() },
        },
      });

      await SystemLogger.logActivity({
        action: 'TOKEN_REFRESHED',
        entity: 'PlatformCredential',
        entityId: credentialId,
        details: { platform: 'META', expiresAt },
      });

      return true;
    } catch (err: any) {
      await SystemLogger.logError({
        message: `Meta token refresh failed: ${err.message}`,
        source: 'TokenRefreshService',
        context: { credentialId },
      });
      return false;
    }
  }

  static async refreshGoogleToken(credentialId: string): Promise<boolean> {
    const cred = await prisma.platformCredential.findUnique({ where: { id: credentialId } });
    if (!cred || cred.platform !== 'GOOGLE' || !cred.refreshToken) return false;

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: cred.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const json = await res.json();
      if (!json.access_token) return false;

      const expiresAt = json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000)
        : undefined;

      await prisma.platformCredential.update({
        where: { id: credentialId },
        data: {
          accessToken: json.access_token,
          expiresAt,
          meta: { ...(cred.meta as any), lastRefreshedAt: new Date().toISOString() },
        },
      });

      await SystemLogger.logActivity({
        action: 'TOKEN_REFRESHED',
        entity: 'PlatformCredential',
        entityId: credentialId,
        details: { platform: 'GOOGLE', expiresAt },
      });

      return true;
    } catch (err: any) {
      await SystemLogger.logError({
        message: `Google token refresh failed: ${err.message}`,
        source: 'TokenRefreshService',
        context: { credentialId },
      });
      return false;
    }
  }

  static async refreshExpiringTokens(): Promise<{ refreshed: number; failed: number }> {
    const expiring = await prisma.platformCredential.findMany({
      where: {
        expiresAt: { not: null },
      },
    });

    let refreshed = 0;
    let failed = 0;

    for (const cred of expiring) {
      if (!cred.expiresAt) continue;
      const daysUntilExpiry = (cred.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
        let ok = false;
        if (cred.platform === 'META') {
          ok = await TokenRefreshService.refreshMetaToken(cred.id);
        } else if (cred.platform === 'GOOGLE' && cred.refreshToken) {
          ok = await TokenRefreshService.refreshGoogleToken(cred.id);
        }
        if (ok) refreshed++;
        else failed++;
      }
    }

    return { refreshed, failed };
  }
}
