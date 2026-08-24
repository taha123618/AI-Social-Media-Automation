import { Platform } from "@/app/generated/prisma/enums";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class InstagramProvider implements ISocialProvider {
   platform = Platform.INSTAGRAM;

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

         const { accessToken, pageId } = credentials;
         const apiUrl = `https://graph.facebook.com/v19.0/${pageId}`;

         if (mediaUrls.length === 0) throw new Error("Instagram requires media");
         const mediaUrl = mediaUrls[0];
         const isVideo = mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov");

         // 1. Create Media Container
         const containerRes = await axios.post(`${apiUrl}/media`, null, {
            params: {
               access_token: accessToken,
               caption: content,
               [isVideo ? "video_url" : "image_url"]: mediaUrl,
               media_type: isVideo ? "REELS" : "IMAGE"
            }
         });
         const containerId = (containerRes.data as any).id;

         // 2. Poll for video processing (required for Reels)
         if (isVideo) {
            console.log(`[INSTAGRAM] Polling status for container ${containerId}...`);
            let processing = true;
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes max

            while (processing && attempts < maxAttempts) {
               attempts++;
               await new Promise(resolve => setTimeout(resolve, 10000)); // 10s wait

               const statusRes = await axios.get(`https://graph.facebook.com/v19.0/${containerId}`, {
                  params: {
                     access_token: accessToken,
                     fields: "status_code"
                  }
               });

               const statusCode = (statusRes.data as any).status_code;
               console.log(`[INSTAGRAM] Container ${containerId} status: ${statusCode}`);

               if (statusCode === "FINISHED") {
                  processing = false;
               } else if (statusCode === "ERROR") {
                  throw new Error(`Instagram video processing failed for container ${containerId}`);
               }
            }

            if (processing) {
               throw new Error(`Instagram video processing timed out for container ${containerId}`);
            }
         }

         // 3. Publish Container
         const publishRes = await axios.post(`${apiUrl}/media_publish`, null, {
            params: {
               access_token: accessToken,
               creation_id: containerId
            }
         });
         const postId = (publishRes.data as any).id;

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: postId,
            details: { platform: this.platform }
         });

         return {
            postId,
            platformUrl: `https://instagram.com/p/${postId}`,
         };
      } catch (error: any) {
         console.error(`[InstagramProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "Instagram post failed",
            source: "InstagramProvider.postContent",
            context: { platform: this.platform }
         });
         throw error;
      }
   }

   async getAnalytics(externalPostId: string, credentials: any): Promise<any> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://graph.facebook.com/v19.0/${externalPostId}/insights`, {
            params: {
               access_token: accessToken,
               metric: "engagement,impressions,reach,saved,video_views"
            }
         });
         const insights = res.data.data.reduce((acc: any, item: any) => {
            acc[item.name] = item.values[0].value;
            return acc;
         }, {});
         return {
            likes: insights.engagement || 0,
            comments: 0,
            reach: insights.reach || 0,
            impressions: insights.impressions || 0,
            saved: insights.saved || 0,
            video_views: insights.video_views || 0
         };
      } catch (error) {
         console.error(`[InstagramProvider] getAnalytics failed:`, error);
         return { likes: 0, comments: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      return { accessToken: "" };
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://graph.facebook.com/v19.0/${accountId}/conversations`, {
            params: {
               access_token: accessToken,
               platform: "instagram",
               fields: "id,participants,updated_time,unread_count,messages.limit(1){message}"
            }
         });
         return res.data.data.map((conv: any) => ({
            id: conv.id,
            participants: conv.participants.data.map((p: any) => ({
               id: p.id,
               username: p.username || p.name,
            })),
            messages: [],
            updatedTime: new Date(conv.updated_time),
         }));
      } catch (error) {
         console.error(`[InstagramProvider] getConversations failed:`, error);
         return [];
      }
   }

   async getMessages(threadId: string, credentials: any): Promise<SocialMessage[]> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://graph.facebook.com/v19.0/${threadId}/messages`, {
            params: {
               access_token: accessToken,
               fields: "id,message,created_time,from"
            }
         });
         return res.data.data.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            from: {
               id: msg.from.id,
               username: msg.from.username || msg.from.name,
            },
            createdAt: new Date(msg.created_time)
         }));
      } catch (error) {
         console.error(`[InstagramProvider] getMessages failed:`, error);
         return [];
      }
   }

   async sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string> {
      try {
         const { accessToken } = credentials;
         const res = await axios.post(`https://graph.facebook.com/v19.0/${accountId}/messages`, {
            recipient: { id: recipientId },
            message: { text },
            access_token: accessToken
         });
         return res.data.message_id;
      } catch (error) {
         console.error(`[InstagramProvider] sendMessage failed:`, error);
         throw error;
      }
   }
}
