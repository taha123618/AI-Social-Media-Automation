import { Platform } from "@/app/generated/prisma/enums";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class FacebookProvider implements ISocialProvider {
   platform = Platform.FACEBOOK;

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
         const mediaUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;

         let res: any;
         if (mediaUrl) {
            if (mediaUrl.endsWith(".mp4")) {
               res = await axios.post(`${apiUrl}/videos`, null, {
                  params: { access_token: accessToken, description: content, file_url: mediaUrl }
               });
            } else {
               res = await axios.post(`${apiUrl}/photos`, null, {
                  params: { access_token: accessToken, caption: content, url: mediaUrl }
               });
            }
         } else {
            res = await axios.post(`${apiUrl}/feed`, null, {
               params: { access_token: accessToken, message: content }
            });
         }

         const postId = (res.data as any).id;

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: postId,
            details: { platform: this.platform }
         });

         return {
            postId,
            platformUrl: `https://facebook.com/${postId}`,
         };
      } catch (error: any) {
         console.error(`[FacebookProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "Facebook post failed",
            source: "FacebookProvider.postContent",
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
               metric: "engagement,impressions,reach"
            }
         });
         const insights = res.data.data.reduce((acc: any, item: any) => {
            acc[item.name] = item.values[0].value;
            return acc;
         }, {});
         return {
            likes: insights.engagement || 0,
            shares: 0,
            comments: 0,
            reach: insights.reach || 0,
            impressions: insights.impressions || 0
         };
      } catch (error) {
         console.error(`[FacebookProvider] getAnalytics failed:`, error);
         return { likes: 0, shares: 0, comments: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      // Facebook long-lived tokens usually last 60 days and don't use standard refresh tokens the same way.
      // But we can implement the exchange if needed.
      return { accessToken: "" };
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://graph.facebook.com/v19.0/${accountId}/conversations`, {
            params: {
               access_token: accessToken,
               fields: "id,participants,updated_time,unread_count,messages.limit(1){message}"
            }
         });
         return res.data.data.map((conv: any) => ({
            id: conv.id,
            participants: conv.participants.data.map((p: any) => ({
               id: p.id,
               username: p.name,
            })),
            messages: [],
            updatedTime: new Date(conv.updated_time),
         }));
      } catch (error) {
         console.error(`[FacebookProvider] getConversations failed:`, error);
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
               username: msg.from.name,
            },
            createdAt: new Date(msg.created_time)
         }));
      } catch (error) {
         console.error(`[FacebookProvider] getMessages failed:`, error);
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
         console.error(`[FacebookProvider] sendMessage failed:`, error);
         throw error;
      }
   }
}
