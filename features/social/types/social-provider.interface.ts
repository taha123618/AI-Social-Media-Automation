import { Platform } from "@/app/generated/prisma/enums";

import { SocialConversation, SocialMessage } from "./social-posting.types";

export interface PostResult {
  postId: string;
  platformUrl: string;
  metadata?: any;
}

export interface ISocialProvider {
  platform: Platform;
  postContent(
    content: string,
    mediaUrls: string[],
    credentials: any
  ): Promise<PostResult>;
  getAnalytics(externalPostId: string, credentials: any): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  getConversations(accountId: string, credentials: any): Promise<SocialConversation[]>;
  getMessages(threadId: string, credentials: any): Promise<SocialMessage[]>;
  sendMessage(accountId: string, recipientId: string, text: string, credentials: any): Promise<string>;
}
