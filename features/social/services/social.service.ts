import prisma from "@/lib/prisma";
import { Platform, toPrismaPlatform } from "@/types";
import { ISocialProvider } from "../types/social-provider.interface";
import { XProvider } from "../providers/x-provider";
import { LinkedInProvider } from "../providers/linkedin-provider";
import { InstagramProvider } from "../providers/instagram-provider";
import { FacebookProvider } from "../providers/facebook-provider";
import { TikTokProvider } from "../providers/tiktok-provider";
import { YouTubeProvider } from "../providers/youtube-provider";
import { SystemLogger } from "@/features/system/services/logger.service";

export class SocialMediaService {
    private static providers: Map<Platform, ISocialProvider> = new Map<Platform, ISocialProvider>([
        [Platform.TWITTER, new XProvider()],
        [Platform.LINKEDIN, new LinkedInProvider()],
        [Platform.INSTAGRAM, new InstagramProvider()],
        [Platform.FACEBOOK, new FacebookProvider()],
        [Platform.TIKTOK, new TikTokProvider()],
        [Platform.YOUTUBE, new YouTubeProvider()],
    ]);

    static async publishInfo(
        businessId: string,
        platform: Platform,
        content: string,
        mediaUrls: string[] = []
    ) {
        const [account, service] = await Promise.all([
            prisma.socialAccount.findFirst({
                where: { businessId, platform: toPrismaPlatform(platform), isActive: true }
      }),
        prisma.thirdPartyService.findFirst({
            where: { businessId, platform: toPrismaPlatform(platform), isActive: true }
        })
    ]);

    if (!account) throw new Error(`No connected account found for ${platform}`);

    const credentials = {
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.tokenExpiresAt,
        pageId: account.platformId,
        personUrn: account.platformId,
        openId: account.platformId,
        accessSecret: account.refreshToken, // For X V1 if stored here
        apiKey: service?.apiKey,
        apiSecret: service?.apiSecret,
        apiTier: service?.apiTier,
    };

        const provider = this.providers.get(platform);
        if (!provider) throw new Error(`Publisher not implemented for platform: ${platform}`);

        try {
            await SystemLogger.logActivity({
                action: "SOCIAL_POST_STARTED",
                entity: "SocialPost",
                details: { businessId, platform, contentPreview: content.substring(0, 50) }
            });

        const result = await provider.postContent(content, mediaUrls, credentials);

        await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            details: { businessId, platform, postId: (result as { postId?: string })?.postId || 'success' }
        });

        return {
        ...result,
        accountId: account.id
      };
        } catch (error: unknown) {
        await SystemLogger.logError({
            message: error instanceof Error ? error.message : "Social post failed",
            source: `SocialMediaService.publishInfo.${platform}`,
            context: { businessId, platform }
        });
        throw error;
    }
  }
    static async getConversations(businessId: string, platform: Platform) {
        const account = await prisma.socialAccount.findFirst({
            where: { businessId, platform: toPrismaPlatform(platform), isActive: true }
        });

        if (!account) {
            // Check if there is ANY account for this platform, maybe it's marked inactive
            const allAccounts = await prisma.socialAccount.findMany({
                where: { businessId, platform: toPrismaPlatform(platform) }
            });
            
            if (allAccounts.length > 0) {
                const inactiveAccount = allAccounts.find(a => !a.isActive);
                if (inactiveAccount) {
                    console.warn(`[SocialMediaService.getConversations] Found account for ${platform} but it's inactive (isActive: false)`);
                    throw new Error(`Connected account for ${platform} is inactive. Please reconnect it.`);
                }
                console.warn(`[SocialMediaService.getConversations] Found ${allAccounts.length} accounts for ${platform} but none are active.`);
            } else {
                console.warn(`[SocialMediaService.getConversations] No account records found for businessId: ${businessId}, platform: ${platform}`);
            }

            throw new Error(`No connected account found for ${platform}`);
        }

        const provider = this.providers.get(platform);
        if (!provider) throw new Error(`Provider not implemented for platform: ${platform}`);

        const credentials = {
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
            apiKey: process.env[`${platform.toUpperCase()}_CLIENT_ID`],
            apiSecret: process.env[`${platform.toUpperCase()}_CLIENT_SECRET`],
        };

        return provider.getConversations(account.platformId || account.id, credentials);
    }

    static async getMessages(businessId: string, platform: Platform, threadId: string) {
        const account = await prisma.socialAccount.findFirst({
            where: { businessId, platform: toPrismaPlatform(platform), isActive: true }
        });

        if (!account) {
            const allAccounts = await prisma.socialAccount.findMany({
                where: { businessId, platform: toPrismaPlatform(platform) }
            });
            if (allAccounts.length > 0) {
                const inactiveAccount = allAccounts.find(a => !a.isActive);
                if (inactiveAccount) {
                    throw new Error(`Connected account for ${platform} is inactive. Please reconnect it.`);
                }
            }
            console.warn(`[SocialMediaService.getMessages] No active account found for businessId: ${businessId}, platform: ${platform}`);
            throw new Error(`No connected account found for ${platform}`);
        }

        const provider = this.providers.get(platform);
        if (!provider) throw new Error(`Provider not implemented for platform: ${platform}`);

        const credentials = {
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
        };

        return provider.getMessages(threadId, credentials);
    }

    static async sendMessage(businessId: string, platform: Platform, recipientId: string, message: string) {
        const account = await prisma.socialAccount.findFirst({
            where: { businessId, platform: toPrismaPlatform(platform), isActive: true }
        });

        if (!account) {
            const allAccounts = await prisma.socialAccount.findMany({
                where: { businessId, platform: toPrismaPlatform(platform) }
            });
            if (allAccounts.length > 0) {
                const inactiveAccount = allAccounts.find(a => !a.isActive);
                if (inactiveAccount) {
                    throw new Error(`Connected account for ${platform} is inactive. Please reconnect it.`);
                }
            }
            console.warn(`[SocialMediaService.sendMessage] No active account found for businessId: ${businessId}, platform: ${platform}`);
            throw new Error(`No connected account found for ${platform}`);
        }

        const provider = this.providers.get(platform);
        if (!provider) throw new Error(`Provider not implemented for platform: ${platform}`);

        const credentials = {
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
        };

        return provider.sendMessage(account.platformId || account.id, recipientId, message, credentials);
    }
}

