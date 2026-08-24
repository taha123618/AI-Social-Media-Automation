import { Platform } from "@/types";
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class XProvider implements ISocialProvider {
   platform = Platform.TWITTER;

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

         const client = new TwitterApi({
            appKey: credentials.apiKey || process.env.TWITTER_API_KEY!,
            appSecret: credentials.apiSecret || process.env.TWITTER_API_SECRET!,
            accessToken: credentials.accessToken,
            accessSecret: credentials.accessSecret,
         });

         const rwClient = client.readWrite;
         const mediaIds: string[] = [];

         // Upload media if present
         for (const url of mediaUrls) {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data as any);
            const mediaId = await client.v1.uploadMedia(buffer, {
               type: url.endsWith('.mp4') ? 'mp4' : 'jpg'
            });
            mediaIds.push(mediaId);
         }

         const payload: any = { text: content };
         if (mediaIds.length > 0) {
            payload.media = { media_ids: mediaIds };
         }

         const { data } = await rwClient.v2.tweet(payload);

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: data.id,
            details: { platform: this.platform }
         });

         return {
            postId: data.id,
            platformUrl: `https://x.com/user/status/${data.id}`,
         };
      } catch (error: any) {
         console.error(`[XProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "X post failed",
            source: "XProvider.postContent",
            context: { platform: this.platform }
         });
         throw error;
      }
   }

   async getAnalytics(externalPostId: string, credentials: any): Promise<any> {
      try {
         const client = new TwitterApi(credentials.accessToken);
         const res = await client.v2.singleTweet(externalPostId, {
            "tweet.fields": ["public_metrics", "non_public_metrics"]
         });
         const data: any = res.data?.public_metrics || {};
         return {
            likes: data.like_count || 0,
            retweets: data.retweet_count || 0,
            replies: data.reply_count || 0,
            quotes: data.quote_count || 0,
            impressions: data.impression_count || 0
         };
      } catch (error) {
         console.error(`[XProvider] getAnalytics failed:`, error);
         return { likes: 0, retweets: 0, replies: 0, quotes: 0, impressions: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      try {
         const client = new TwitterApi({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
         });
         const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(refreshToken);
         return { accessToken, refreshToken: newRefreshToken, expiresIn };
      } catch (error) {
         console.error(`[XProvider] refreshToken failed:`, error);
         throw error;
      }
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      try {
         const client = new TwitterApi(credentials.accessToken);
         const dms = await client.v2.listDmEvents();
         // Group events into conversations (simplified)
         const conversationsMap = new Map<string, SocialConversation>();
         
         for (const event of dms.events) {
            if (event.event_type === 'MessageCreate') {
               const convId = event.dm_conversation_id;
               if (!conversationsMap.has(<string>convId)) {
                  conversationsMap.set(<string>convId, {
                     id: <string>convId,
                     participants: [], // Needs extra lookup to be fully accurate
                     messages: [],
                     updatedTime: new Date(event.created_at!),
                  });
               }
            }
         }
         return Array.from(conversationsMap.values());
      } catch (error) {
         console.error(`[XProvider] getConversations failed:`, error);
         return [];
      }
   }

   async getMessages(threadId: string, credentials: any): Promise<SocialMessage[]> {
      try {
         const client = new TwitterApi(credentials.accessToken);
         const dms = await client.v2.listDmEventsOfConversation(threadId);
         return dms.events.map((event: any) => ({
            id: event.id,
            text: event.text || "",
            from: {
               id: event.sender_id,
               username: "User", // Needs lookup
            },
            createdAt: new Date(event.created_at!)
         }));
      } catch (error) {
         console.error(`[XProvider] getMessages failed:`, error);
         return [];
      }
   }

   async sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string> {
      try {
         const client = new TwitterApi(credentials.accessToken);
         const result = await client.v2.sendDmToParticipant(recipientId, { text });
         return result.dm_conversation_id;
      } catch (error) {
         console.error(`[XProvider] sendMessage failed:`, error);
         throw error;
      }
   }
}
