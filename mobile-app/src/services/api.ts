import { postsApi } from '@/api/posts';
import { calendarApi } from '@/api/calendar';
import { inboxApi } from '@/api/inbox';
import { analyticsApi } from '@/api/analytics';
import { settingsApi } from '@/api/settings';
import { workspacesApi } from '@/api/workspaces';
import { Post, CalendarSlot, Conversation, AnalyticsData } from '@/types/api';

export const ApiService = {
  getPosts: async (status?: string): Promise<Post[]> => {
    return postsApi.getPosts(status);
  },

  createPost: async (payload: any): Promise<Post> => {
    return postsApi.createPost(payload);
  },

  deletePost: async (postId: string): Promise<void> => {
    return postsApi.deletePost(postId);
  },

  publishPost: async (postId: string): Promise<void> => {
    return postsApi.publishPost(postId);
  },

  getCalendarSlots: async (): Promise<CalendarSlot[]> => {
    return calendarApi.getCalendarSlots();
  },

  getConversations: async (): Promise<Conversation[]> => {
    return inboxApi.getConversations();
  },

  sendReply: async (conversationId: string, replyText: string): Promise<void> => {
    return inboxApi.sendReply(conversationId, replyText);
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    return analyticsApi.getAnalytics();
  },

  generateCaption: async (topicPrompt: string, platform: any): Promise<string> => {
    return postsApi.generateCopy(topicPrompt, platform);
  },

  getApiKeys: async (): Promise<any[]> => {
    const res = await settingsApi.getApiKeysAndWebhooks();
    return res.apiKeys;
  },

  getWebhooks: async (): Promise<any[]> => {
    const res = await settingsApi.getApiKeysAndWebhooks();
    return res.webhooks;
  },

  getWorkspaces: async (): Promise<any[]> => {
    return workspacesApi.getWorkspaces();
  },

  createWorkspace: async (name: string): Promise<any> => {
    return workspacesApi.createWorkspace(name);
  },
};
