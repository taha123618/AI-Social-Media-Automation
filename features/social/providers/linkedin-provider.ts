import { Platform } from "@/app/generated/prisma/enums";
import axios from "axios";
import { ISocialProvider, PostResult } from "../types/social-provider.interface";
import { SystemLogger } from "@/features/system/services/logger.service";
import { SocialConversation, SocialMessage } from "../types/social-posting.types";

export class LinkedInProvider implements ISocialProvider {
   platform = Platform.LINKEDIN;

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

         const { accessToken, personUrn } = credentials;
         const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
         };

         let assetUrn = null;

         if (mediaUrls.length > 0) {
            const mediaUrl = mediaUrls[0];
            const isVideo = mediaUrl.endsWith('.mp4');

            // Register upload
            const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
               registerUploadRequest: {
                  recipes: [isVideo ? "urn:li:digitalmediaRecipe:feedshare-video" : "urn:li:digitalmediaRecipe:feedshare-image"],
                  owner: personUrn,
                  serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }]
               }
            }, { headers });

            const uploadUrl = (registerRes.data as any).value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            assetUrn = (registerRes.data as any).value.asset;

            // Upload binary
            const fileRes = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            await axios.put(uploadUrl, fileRes.data as any, {
               headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/octet-stream' }
            });
         }

         const shareBody = {
            author: personUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
               "com.linkedin.ugc.ShareContent": {
                  shareCommentary: { text: content },
                  shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
                  media: assetUrn ? [{
                     status: "READY",
                     description: { text: "Generated Image" },
                     media: assetUrn,
                     title: { text: "Brand Post" }
                  }] : undefined
               }
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
         };

         const postRes = await axios.post('https://api.linkedin.com/v2/ugcPosts', shareBody, { headers });
         const urn = (postRes.data as any).id;

         await SystemLogger.logActivity({
            action: "SOCIAL_POST_COMPLETED",
            entity: "SocialPost",
            entityId: urn,
            details: { platform: this.platform }
         });

         return {
            postId: urn,
            platformUrl: `https://www.linkedin.com/feed/update/${urn}`,
         };
      } catch (error: any) {
         console.error(`[LinkedInProvider] Post failed:`, error);
         await SystemLogger.logError({
            message: error.message || "LinkedIn post failed",
            source: "LinkedInProvider.postContent",
            context: { platform: this.platform }
         });
         throw error;
      }
   }

   async getAnalytics(externalPostId: string, credentials: any): Promise<any> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://api.linkedin.com/v2/socialMetadata/${encodeURIComponent(externalPostId)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
         });
         return res.data;
      } catch (error) {
         console.error(`[LinkedInProvider] getAnalytics failed:`, error);
         return { likes: 0, comments: 0, shares: 0 };
      }
   }

   async refreshToken(refreshToken: string): Promise<any> {
      try {
         const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
               grant_type: 'refresh_token',
               refresh_token: refreshToken,
               client_id: process.env.LINKEDIN_CLIENT_ID,
               client_secret: process.env.LINKEDIN_CLIENT_SECRET
            }
         });
         return res.data;
      } catch (error) {
         console.error(`[LinkedInProvider] refreshToken failed:`, error);
         throw error;
      }
   }

   async getConversations(accountId: string, credentials: any): Promise<SocialConversation[]> {
      // LinkedIn Messaging API is part of the 'Communication' product and is highly restricted.
      // Usually requires "Messaging" scope which is not available to all apps.
      try {
         const { accessToken } = credentials;
         const res = await axios.get('https://api.linkedin.com/v2/communications/conversations', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
         });
         return (res.data.elements || []).map((conv: any) => ({
            id: conv.id,
            participants: [], // Requires further lookup
            messages: [],
            updatedTime: new Date(conv.lastActivityAt),
         }));
      } catch (error) {
         console.error(`[LinkedInProvider] getConversations failed:`, error);
         return [];
      }
   }

   async getMessages(threadId: string, credentials: any): Promise<SocialMessage[]> {
      try {
         const { accessToken } = credentials;
         const res = await axios.get(`https://api.linkedin.com/v2/communications/conversations/${threadId}/messages`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
         });
         return (res.data.elements || []).map((msg: any) => ({
            id: msg.id,
            text: msg.body.text,
            from: {
               id: msg.sender,
               username: "Member",
            },
            createdAt: new Date(msg.createdAt)
         }));
      } catch (error) {
         console.error(`[LinkedInProvider] getMessages failed:`, error);
         return [];
      }
   }

   async sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string> {
      try {
         const { accessToken } = credentials;
         const res = await axios.post(`https://api.linkedin.com/v2/communications/messages`, {
            recipients: [recipientId],
            body: { text },
            category: "MESSAGE"
         }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
         });
         return res.headers['x-restli-id'] || "sent";
      } catch (error) {
         console.error(`[LinkedInProvider] sendMessage failed:`, error);
         throw error;
      }
   }
}
