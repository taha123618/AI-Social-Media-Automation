import { http } from './client';
import { Conversation, SocialPlatform } from '@/types/api';

export const inboxApi = {
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await http.get<{ rules?: any[]; data?: any }>('/api/dm-automation/rules');
      const rules = res.rules || res.data?.rules;

      if (rules && Array.isArray(rules)) {
        return rules.map((r: any, idx: number) => ({
          id: r.id || `dm_${idx}`,
          senderName: r.name || `Prospect ${idx + 1}`,
          senderAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
          platform: (r.platform?.toLowerCase() || 'linkedin') as SocialPlatform,
          lastMessage: r.replyTemplate || r.triggerKeywords?.[0] || 'Inquiry about enterprise features',
          timestamp: `${idx * 15 + 2}m ago`,
          unreadCount: idx < 2 ? 1 : 0,
          intentTag: (r.actionType === 'LEAD_CAPTURE' ? 'LEAD' : idx % 2 === 0 ? 'PRICING' : 'SUPPORT') as any,
          suggestedReply: r.replyTemplate || 'Thanks for reaching out! Here is the complete breakdown.',
          status: 'PENDING',
        }));
      }
      return [];
    } catch (err) {
      console.warn('[InboxAPI] Failed to fetch live conversations:', err);
      return [];
    }
  },

  sendReply: async (conversationId: string, replyText: string): Promise<void> => {
    await http.post('/api/dm-automation/simulate', {
      businessId: 'default',
      messageText: replyText,
      platform: 'INSTAGRAM',
      senderName: 'SocialAI Mobile Client',
    });
  },
};
