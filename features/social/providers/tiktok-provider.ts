import { Platform } from "@/app/generated/prisma/enums";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class TikTokProvider implements ISocialProvider {
   platform = Platform.TIKTOK;

   async postContent(
      content: string,
      mediaUrls: string[],
      credentials: any
   ): Promise<PostResult> {
      try {
         await SystemLogger.logActivity({
            action: "SOCIAL_POST_STARTED",
            entity: "SocialPost",
            details: { platform: this.platform, mediaCount: mediaUrls.length }
         });

         const { accessToken } = credentials;
         if (mediaUrls.length === 0) throw new Error("TikTok requires video");
         const videoUrl = mediaUrls[0];

         // 1. Initialize Post
         const initRes = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            post_info: {
               title: content.substring(0, 150),
               privacy_level: "PUBLIC_TO_EVERYONE",
               disable_duet: false,
               disable_comment: false,
               video_cover_timestamp_ms: 1000
            }
         }, {
            headers: {
               'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json'
            }
         });

         const uploadUrl = (initRes.data as any).data.upload_url;
         const publishId = (initRes.data as any).data.publish_id;

         // 2. Upload Video
         const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
         await axios.put(uploadUrl, videoBuffer.data as any, {
            headers: { 'Content-Type': 'video/mp4' }
         });

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: publishId,
            details: { platform: this.platform }
         });

         return {
            postId: publishId,
            platformUrl: `https://www.tiktok.com/@user/video/${publishId}`,
         };
      } catch (error: any) {
         console.error(`[TikTokProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "TikTok post failed",
            source: "TikTokProvider.postContent",
            context: { platform: this.platform }
         });
         throw error;
      }
   }

   async getAnalytics(externalPostId: string, credentials: any): Promise<any> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://open.tiktokapis.com/v2/post/publish/video/status/`, {
            params: { publish_id: externalPostId },
            headers: { 'Authorization': `Bearer ${accessToken}` }
         });
         // TikTok status API returns status, but for actual insights we need the Video API
         return res.data.data || { views: 0, likes: 0 };
      } catch (error) {
         console.error(`[TikTokProvider] getAnalytics failed:`, error);
         return { views: 0, likes: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      try {
         const res = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
         });
         return res.data;
      } catch (error) {
         console.error(`[TikTokProvider] refreshToken failed:`, error);
         throw error;
      }
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      // TikTok Business API for DMs is restricted and requires specific permissions
      return [];
   }

   async getMessages(threadId: string, credentials: any): Promise<SocialMessage[]> {
      return [];
   }

   async sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string> {
      return "not_supported";
   }
}
