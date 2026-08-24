import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import prisma from '@/lib/prisma';
import { emailQueue } from '@/lib/emailQueue';
import { getIO } from '@/lib/socket-handler';
import { SystemLogger } from '@/features/system/services/logger.service';
import { TokenRefreshService } from '../services/token-refresh.service';

export class CredentialHealthWorker {
  private worker: Worker | null = null;

  constructor() {
    this.worker = new Worker('credential-health', this.processJob.bind(this), { connection: REDIS_CONNECTION_CONFIG });

    this.worker.on('completed', job => {
      console.log('[CredentialHealth] Completed job', job.id);
    });

    this.worker.on('failed', (job, err) => {
      console.error('[CredentialHealth] Job failed', err);
    });
  }

  private async processJob(_job?: Job) {
    const creds = await prisma.platformCredential.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: { business: { include: { members: { where: { role: 'OWNER' }, include: { user: true } } } } },
    });

    for (const c of creds) {
      try {
        const owners = c.business?.members ?? [];
        const ownerUsers = owners.map(m => m.user).filter(Boolean);

        if (c.expiresAt) {
          const now = new Date();
          const then = new Date(c.expiresAt);
          const diff = then.getTime() - now.getTime();
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

          if (days <= 7 && days > 0) {
            // Try auto-refresh first
            let refreshed = false;
            if (c.platform === 'META') {
              refreshed = await TokenRefreshService.refreshMetaToken(c.id);
            } else if (c.platform === 'GOOGLE' && c.refreshToken) {
              refreshed = await TokenRefreshService.refreshGoogleToken(c.id);
            }

            if (refreshed) {
              await SystemLogger.logActivity({
                action: 'CREDENTIAL_AUTO_REFRESHED',
                entity: 'PlatformCredential',
                entityId: c.id,
                details: { platform: c.platform, businessId: c.businessId },
              });
              continue;
            }

            // Create notifications for each owner
            for (const user of ownerUsers) {
              await prisma.notification.create({
                data: {
                  userId: user.id,
                  businessId: c.businessId,
                  type: 'SYSTEM',
                  title: `${c.platform} credential expiring`,
                  message: `Your ${c.platform} ad credential will expire in ${days} day(s). Please reconnect to avoid campaign interruptions.`,
                  entityId: c.id,
                  entityType: 'PLATFORM_CREDENTIAL',
                },
              });

              // Send email alert
              if (user.email) {
                await emailQueue.add('credential-expiry', {
                  to: user.email,
                  subject: `[Action Required] ${c.platform} Ad Credential Expiring in ${days} Days`,
                  html: `<h2>${c.platform} Credential Expiring</h2>
<p>Your ${c.platform} ad platform credential for business <strong>${c.business?.name ?? c.businessId}</strong> will expire in <strong>${days} day(s)</strong>.</p>
<p>Please reconnect your account to avoid campaign interruptions.</p>
<p><a href="${process.env.FRONTEND_URL}/settings/ads" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">Reconnect Now</a></p>`,
                  type: 'workflow-notification',
                });
              }
            }

            // Emit websocket event for live dashboard
            const io = getIO();
            if (io) {
              io.to(`business-${c.businessId}`).emit('credential-expiring', {
                credentialId: c.id,
                platform: c.platform,
                daysUntilExpiry: days,
              });
            }
          }
        }

        // Check for already expired credentials
        if (c.expiresAt && c.expiresAt < new Date()) {
          for (const user of ownerUsers) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                businessId: c.businessId,
                type: 'SYSTEM',
                title: `${c.platform} credential expired`,
                message: `Your ${c.platform} ad credential has expired. Campaigns may fail. Please reconnect immediately.`,
                entityId: c.id,
                entityType: 'PLATFORM_CREDENTIAL',
              },
            });
          }
        }
      } catch (err) {
        console.error('[CredentialHealth] error processing credential', c.id, err);
      }
    }
  }

  async close() {
    if (this.worker) await this.worker.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const w = new CredentialHealthWorker();
  console.log('[Worker] Credential Health Worker started');
  process.on('SIGINT', async () => { await w.close(); process.exit(0); });
}
