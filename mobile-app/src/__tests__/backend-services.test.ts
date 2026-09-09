import { describe, it, expect, beforeEach, mock } from 'bun:test';
import axios from 'axios';
import { backendApi } from '../lib/backend';
import { useAuthStore } from '../stores/auth.store';
import { useWorkspaceStore } from '../stores/workspace.store';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
mock.module('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: mock((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: mock((key: string, val: string) => {
      mockStorage[key] = val;
      return Promise.resolve();
    }),
    removeItem: mock((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: mock(() => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      return Promise.resolve();
    }),
  },
}));

// Mock axios so backendApi calls resolve with canned backend responses
mock.module('axios', () => ({
  default: {
    get: mock(() => Promise.resolve({ data: {} })),
    post: mock(() => Promise.resolve({ data: {} })),
    put: mock(() => Promise.resolve({ data: {} })),
    delete: mock(() => Promise.resolve({ data: {} })),
  },
}));

describe('Mobile App - Direct Backend API & Multi-Tenant State', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      activeWorkspaceId: '',
      workspaces: [],
    });
    useWorkspaceStore.setState({
      workspaces: [],
      activeWorkspaceId: '',
      isLoading: false,
    });
  });

  describe('getPosts', () => {
    it('maps live posts from backend response correctly', async () => {
      const mockBackendPosts = [
        {
          id: 'post_101',
          content: 'Excited to announce our new autonomous AI capabilities!',
          platform: 'LINKEDIN',
          status: 'POSTED',
          postedAt: '2026-09-09T10:00:00Z',
          mediaUrls: ['https://s3.amazonaws.com/image.png'],
          analytics: { likes: 45, comments: 12, shares: 8, impressions: 1200 },
        },
      ];

      axios.get = mock(() =>
        Promise.resolve({
          data: { success: true, data: { posts: mockBackendPosts } },
        })
      ) as any;

      const posts = await backendApi.getPosts();
      expect(posts).toBeArray();
      expect(posts.length).toBe(1);
      expect(posts[0].id).toBe('post_101');
      expect(posts[0].status).toBe('PUBLISHED');
      expect(posts[0].platforms).toEqual(['linkedin']);
      expect(posts[0].analytics?.likes).toBe(45);
      expect(posts[0].mediaUrl).toBe('https://s3.amazonaws.com/image.png');
    });

    it('returns empty array when backend returns no posts', async () => {
      axios.get = mock(() => Promise.resolve({ data: { success: true, data: { posts: [] } } })) as any;

      const posts = await backendApi.getPosts();
      expect(posts).toEqual([]);
    });

    it('handles createPost with AI generation endpoint', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            data: {
              draft: {
                id: 'post_ai_generated_1',
                content: 'Scale your SaaS with AI agents #Growth',
              },
            },
          },
        })
      ) as any;

      const newPost = await backendApi.createPost({
        content: 'Topic: Scaling SaaS',
        platforms: ['linkedin', 'x'],
      });

      expect(newPost.id).toBe('post_ai_generated_1');
      expect(newPost.content).toBe('Scale your SaaS with AI agents #Growth');
      expect(newPost.platforms).toEqual(['linkedin', 'x']);
      expect(newPost.status).toBe('SCHEDULED');
    });
  });

  describe('getCalendarSlots', () => {
    it('maps posting schedule slots with 12-hour AM/PM formatting', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            slots: [
              { id: 'slot_1', dayOfWeek: 'MONDAY', hour: 9, minute: 30, isEnabled: true },
              { id: 'slot_2', dayOfWeek: 'FRIDAY', hour: 16, minute: 0, isEnabled: true },
            ],
          },
        })
      ) as any;

      const slots = await backendApi.getCalendarSlots();
      expect(slots.length).toBe(2);
      expect(slots[0].dayOfWeek).toBe(1); // Monday
      expect(slots[0].time).toBe('09:30 AM');
      expect(slots[0].isPeakHour).toBe(true);

      expect(slots[1].dayOfWeek).toBe(5); // Friday
      expect(slots[1].time).toBe('04:00 PM');
      expect(slots[1].isPeakHour).toBe(false);
    });

    it('returns empty array if no calendar slots configured', async () => {
      axios.get = mock(() => Promise.resolve({ data: { slots: [] } })) as any;

      const slots = await backendApi.getCalendarSlots();
      expect(slots).toEqual([]);
    });
  });

  describe('getConversations & sendReply', () => {
    it('maps incoming DM automation rules to conversations', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            rules: [
              {
                id: 'rule_1',
                name: 'Enterprise Pricing Inquiry',
                platform: 'LINKEDIN',
                triggerKeywords: ['pricing', 'quote'],
                replyTemplate: 'Here is our tier breakdown: Pro ($49/mo), Enterprise ($199/mo).',
                actionType: 'LEAD_CAPTURE',
              },
            ],
          },
        })
      ) as any;

      const convs = await backendApi.getConversations();
      expect(convs.length).toBe(1);
      expect(convs[0].senderName).toBe('Enterprise Pricing Inquiry');
      expect(convs[0].intentTag).toBe('LEAD');
      expect(convs[0].suggestedReply).toContain('Pro ($49/mo)');
    });

    it('dispatches simulated replies to the backend', async () => {
      let postBody: any = null;
      axios.post = mock((url: string, body: any) => {
        postBody = body;
        return Promise.resolve({ data: { success: true } });
      }) as any;

      await backendApi.sendReply('dm_1', 'Thanks for contacting us!');
      expect(postBody).not.toBeNull();
      expect(postBody.messageText).toBe('Thanks for contacting us!');
    });
  });

  describe('getAnalytics', () => {
    it('aggregates live metrics from overview and growth endpoints', async () => {
      axios.get = mock((url: string) => {
        if (url.includes('overview')) {
          return Promise.resolve({
            data: {
              impressions: 250000,
              impressionsChange: '+34.2%',
              likes: 8400,
              comments: 1200,
              shares: 450,
              leadCount: 94,
              leadCountChange: '+18.5%',
              totalPosts: 65,
              engagementRate: '4.0',
              aiPerformanceScore: '94%',
              predictedGrowth: '+22.4%',
            },
          });
        }
        if (url.includes('growth')) {
          return Promise.resolve({
            data: {
              growth: {
                leadsCaptured: 94,
                postsPublished: 65,
              },
            },
          });
        }
        return Promise.resolve({ data: {} });
      }) as any;

      const analytics = await backendApi.getAnalytics();
      expect(analytics.totalImpressions).toBe('250.0K');
      expect(analytics.attributedLeads).toBe(94);
      expect(analytics.avgEngagementRate).toBe('4.0%');
      expect(analytics.quotas.posts.used).toBe(65);
    });

    it('returns structured zero-state on network or server failure', async () => {
      axios.get = mock(() => Promise.reject(new Error('Network error'))) as any;

      const analytics = await backendApi.getAnalytics();
      expect(analytics.totalImpressions).toBe('0');
      expect(analytics.attributedLeads).toBe(0);
      expect(analytics.avgEngagementRate).toBe('0.0%');
      expect(analytics.quotas.posts.used).toBe(0);
    });
  });

  describe('workspaces', () => {
    it('fetches workspaces and handles tenant creation', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'biz_alpha', name: 'Alpha Agency', role: 'OWNER', planTier: 'Enterprise' },
            ],
          },
        })
      ) as any;

      const workspaces = await backendApi.getWorkspaces();
      expect(workspaces.length).toBe(1);
      expect(workspaces[0].name).toBe('Alpha Agency');
      expect(workspaces[0].planTier).toBe('Enterprise');

      axios.post = mock((_url: string, body: any) =>
        Promise.resolve({
          data: {
            success: true,
            data: { id: 'biz_beta', name: body.name, role: 'OWNER', planTier: body.planTier },
          },
        })
      ) as any;

      const created = await backendApi.createWorkspace('Beta Corp', 'Pro');
      expect(created.id).toBe('biz_beta');
      expect(created.name).toBe('Beta Corp');
    });
  });

  describe('getApiKeysAndWebhooks', () => {
    it('masks production API keys and extracts webhook endpoints', async () => {
      axios.get = mock((url: string) => {
        if (url.includes('api-keys')) {
          return Promise.resolve({
            data: {
              keys: [
                { id: 'k_1', name: 'Prod Key', key: 'sai_live_prod_test_sample_key_48109', createdAt: '2026-09-01' },
              ],
              hmacSecret: 'sai_whsec_sample_secret_123',
            },
          });
        }
        if (url.includes('webhooks')) {
          return Promise.resolve({
            data: {
              webhooks: [
                { id: 'wh_1', url: 'https://client.com/webhook', events: ['post.published'], isActive: true },
              ],
            },
          });
        }
        return Promise.resolve({ data: {} });
      }) as any;

      const data = await backendApi.getApiKeysAndWebhooks();
      expect(data.apiKeys.length).toBe(1);
      expect(data.apiKeys[0].keyMasked).toContain('••••••••••••');
      expect(data.webhooks.length).toBe(1);
      expect(data.webhooks[0].status).toBe('ACTIVE');
      expect(data.hmacSecret).toBe('sai_whsec_sample_secret_123');
    });
  });

  describe('useWorkspaceStore & useAuthStore', () => {
    it('isolates active workspace tenant context', async () => {
      useWorkspaceStore.setState({
        workspaces: [
          { id: 'biz_1', name: 'Workspace One', role: 'OWNER', planTier: 'Pro' },
          { id: 'biz_2', name: 'Workspace Two', role: 'ADMIN', planTier: 'Starter' },
        ],
        activeWorkspaceId: 'biz_1',
      });

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe('biz_1');
      await useWorkspaceStore.getState().setActiveWorkspace('biz_2');
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe('biz_2');
    });
  });
});