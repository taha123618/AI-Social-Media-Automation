import { google } from "googleapis";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { Platform } from "@/app/generated/prisma/enums";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class YouTubeProvider implements ISocialProvider {
   platform = Platform.YOUTUBE;

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

         const { refreshToken, apiKey: clientId, apiSecret: clientSecret } = credentials;
         const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
         oauth2Client.setCredentials({ refresh_token: refreshToken });

         const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
         if (mediaUrls.length === 0) throw new Error("YouTube requires video URL");
         const videoUrl = mediaUrls[0];

         const videoStream = await axios({ url: videoUrl, responseType: 'stream' });

         const res = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
               snippet: {
                  title: content.substring(0, 100),
                  description: content,
                  tags: ['AIAutomation', 'SocialMedia'],
               },
               status: { privacyStatus: 'public' }
            },
            media: {
               body: videoStream.data as any
            }
         });

         const videoId = res.data.id!;

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: videoId,
            details: { platform: this.platform }
         });

         return {
            postId: videoId,
            platformUrl: `https://youtu.be/${videoId}`,
         };
      } catch (error: any) {
         console.error(`[YouTubeProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "YouTube post failed",
            source: "YouTubeProvider.postContent",
            context: { platform: this.platform }
         });
         throw error;
      }
   }

   async getAnalytics(externalPostId: string, credentials: any): Promise<any> {
      try {
         const { refreshToken, apiKey: clientId, apiSecret: clientSecret } = credentials;
         const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
         oauth2Client.setCredentials({ refresh_token: refreshToken });
         const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

         const res = await youtube.videos.list({
            id: [externalPostId],
            part: ['statistics']
         });

         const stats: any = res.data.items?.[0]?.statistics || {};
         return {
            views: parseInt(stats.viewCount || "0"),
            likes: parseInt(stats.likeCount || "0"),
            comments: parseInt(stats.commentCount || "0"),
            favorites: parseInt(stats.favoriteCount || "0")
         };
      } catch (error) {
         console.error(`[YouTubeProvider] getAnalytics failed:`, error);
         return { views: 0, likes: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      try {
         const oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET
         );
         oauth2Client.setCredentials({ refresh_token: refreshToken });
         const { credentials } = await oauth2Client.refreshAccessToken();
         return {
            accessToken: credentials.access_token,
            expiryDate: credentials.expiry_date
         };
      } catch (error) {
         console.error(`[YouTubeProvider] refreshToken failed:`, error);
         throw error;
      }
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      try {
         const { refreshToken, apiKey: clientId, apiSecret: clientSecret } = credentials;
         const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
         oauth2Client.setCredentials({ refresh_token: refreshToken });
         const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

         // YouTube doesn't have "conversations" in the traditional DM sense.
         // We'll treat video comment threads as conversations.
         const res = await youtube.commentThreads.list({
            allThreadsRelatedToChannelId: accountId,
            part: ['snippet'],
            maxResults: 20
         });

         return (res.data.items || []).map((item: any) => ({
            id: item.id,
            participants: [{
               id: item.snippet.topLevelComment.snippet.authorChannelId.value,
               username: item.snippet.topLevelComment.snippet.authorDisplayName,
            }],
            messages: [],
            updatedTime: new Date(item.snippet.topLevelComment.snippet.updatedAt || item.snippet.topLevelComment.snippet.publishedAt),
         }));
      } catch (error) {
         console.error(`[YouTubeProvider] getConversations failed:`, error);
         return [];
      }
   }

   async getMessages(threadId: string, credentials: any): Promise<SocialMessage[]> {
      try {
         const { refreshToken, apiKey: clientId, apiSecret: clientSecret } = credentials;
         const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
         oauth2Client.setCredentials({ refresh_token: refreshToken });
         const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

         const res = await youtube.comments.list({
            parentId: threadId,
            part: ['snippet'],
            maxResults: 50
         });

         // Also get the top level comment
         const parentRes = await youtube.commentThreads.list({
            id: [threadId],
            part: ['snippet']
         });

         const messages: SocialMessage[] = [];

         const parentItem: any = parentRes.data.items?.[0];
         if (parentItem) {
            const top = parentItem.snippet.topLevelComment;
            messages.push({
               id: top.id,
               text: top.snippet.textDisplay,
               from: {
                  id: top.snippet.authorChannelId.value,
                  username: top.snippet.authorDisplayName,
               },
               createdAt: new Date(top.snippet.publishedAt)
            });
         }

         const replies = (res.data.items || []).map((item: any) => ({
            id: item.id,
            text: item.snippet.textDisplay,
            from: {
               id: item.snippet.authorChannelId.value,
               username: item.snippet.authorDisplayName,
            },
            createdAt: new Date(item.snippet.publishedAt)
         }));

         return [...messages, ...replies].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      } catch (error) {
         console.error(`[YouTubeProvider] getMessages failed:`, error);
         return [];
      }
   }

   async sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string> {
      try {
         const { refreshToken, apiKey: clientId, apiSecret: clientSecret } = credentials;
         const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
         oauth2Client.setCredentials({ refresh_token: refreshToken });
         const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

         // If recipientId is a threadId, we reply to it
         const res = await youtube.comments.insert({
            part: ['snippet'],
            requestBody: {
               snippet: {
                  parentId: recipientId,
                  textOriginal: text
               }
            }
         });

         return res.data.id!;
      } catch (error) {
         console.error(`[YouTubeProvider] sendMessage failed:`, error);
         throw error;
      }
   }
}
