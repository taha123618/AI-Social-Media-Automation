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

  describe('AI Arena & Competitors', () => {
    it('fetches multi-model comparison results', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            data: {
              results: [
                { modelId: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', output: 'Strategy 1', latencyMs: 380, qualityScore: 95 },
                { modelId: 'claude-3-5', name: 'Claude 3.5', provider: 'Anthropic', output: 'Strategy 2', latencyMs: 420, qualityScore: 94 },
              ],
              summary: { winner: 'gpt-4o' },
            },
          },
        })
      ) as any;

      const res = await backendApi.getArenaComparison('Test prompt');
      expect(res.results.length).toBe(2);
      expect(res.recommendedModelId).toBe('gpt-4o');
    });

    it('fetches competitor intelligence and SWOT radar', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            competitors: [
              { id: 'c1', domain: 'buffer.com', name: 'Buffer', estimatedTraffic: '2M', topKeywords: ['scheduler'], strengths: ['UX'], weaknesses: ['No AI'], marketSharePercent: 30 },
            ],
          },
        })
      ) as any;

      const comps = await backendApi.getCompetitorInsights('buffer.com');
      expect(comps.length).toBe(1);
      expect(comps[0].name).toBe('Buffer');
      expect(comps[0].marketSharePercent).toBe(30);
    });
  });

  describe('Blog & Ad Campaigns', () => {
    it('fetches blog articles list', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            articles: [
              { id: 'b1', title: 'SEO Guide', slug: 'seo-guide', status: 'PUBLISHED', seoScore: 92, wordCount: 1500, targetKeyword: 'seo' },
            ],
          },
        })
      ) as any;

      const blogs = await backendApi.getBlogArticles();
      expect(blogs.length).toBe(1);
      expect(blogs[0].title).toBe('SEO Guide');
      expect(blogs[0].seoScore).toBe(92);
    });

    it('fetches paid ad campaigns and ROAS metrics', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            campaigns: [
              { id: 'ad1', name: 'Meta Retargeting', platform: 'META', status: 'ACTIVE', dailyBudget: 100, spent: 500, roas: 3.8, impressions: 20000, clicks: 1200, conversions: 45, variantsCount: 4 },
            ],
          },
        })
      ) as any;

      const ads = await backendApi.getAdCampaigns();
      expect(ads.length).toBe(1);
      expect(ads[0].name).toBe('Meta Retargeting');
      expect(ads[0].roas).toBe(3.8);
    });
  });

  describe('Social Listening, Reviews & Multi-Location', () => {
    it('fetches social listening radar mentions', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            mentions: [
              { id: 'm1', author: '@growth_lead', platform: 'x', content: 'SocialAI is awesome', sentiment: 'POSITIVE', sentimentScore: 96, reach: 10000, timestamp: '5m ago', engagement: 50 },
            ],
          },
        })
      ) as any;

      const mentions = await backendApi.getSocialListeningRadar();
      expect(mentions.length).toBe(1);
      expect(mentions[0].sentiment).toBe('POSITIVE');
    });

    it('fetches reviews and dispatches smart review requests', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            reviews: [
              { id: 'r1', author: 'Jane Doe', rating: 5, source: 'GOOGLE', comment: 'Loved it!', timestamp: '1h ago', replyStatus: 'PENDING' },
            ],
          },
        })
      ) as any;

      const reviews = await backendApi.getReviews();
      expect(reviews.length).toBe(1);
      expect(reviews[0].rating).toBe(5);

      let postUrl = '';
      axios.post = mock((url: string) => {
        postUrl = url;
        return Promise.resolve({ data: { success: true } });
      }) as any;

      await backendApi.requestReview('Jane Doe', '+15550192', 'SMS');
      expect(postUrl).toContain('/api/reviews/request');
    });

    it('fetches multi-location branches and synchronization state', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            locations: [
              { id: 'loc1', name: 'Austin Branch', address: '123 Main', city: 'Austin', state: 'TX', activeCampaigns: 2, localEngagementRate: '5.1%', isSynced: true },
            ],
          },
        })
      ) as any;

      const locs = await backendApi.getLocations();
      expect(locs.length).toBe(1);
      expect(locs[0].city).toBe('Austin');
      expect(locs[0].isSynced).toBe(true);
    });
  });

  describe('Knowledge, Trends, Team & Billing', () => {
    it('fetches knowledge profile brand DNA', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            profile: {
              brandVoice: 'Authoritative B2B SaaS',
              targetAudience: 'Founders',
              industry: 'MarTech',
              keyProducts: ['Agent Swarms'],
              documentsCount: 12,
              lastTrainedAt: 'Today',
            },
          },
        })
      ) as any;

      const profile = await backendApi.getKnowledgeProfile();
      expect(profile.brandVoice).toBe('Authoritative B2B SaaS');
      expect(profile.documentsCount).toBe(12);
    });

    it('fetches viral trend events', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            data: {
              opportunities: [
                { id: 't1', title: 'Agentic AI 2026', type: 'AI', velocityScore: 99, strategy: 'Hooks...', peakWindow: '24h' },
              ],
            },
          },
        })
      ) as any;

      const trends = await backendApi.getTrendEvents('San Francisco');
      expect(trends.length).toBe(1);
      expect(trends[0].velocityScore).toBe(99);
    });

    it('fetches team members and sends invites', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            members: [
              { id: 'u1', name: 'Alice', email: 'alice@corp.com', role: 'ADMIN', joinedAt: '1m ago' },
            ],
          },
        })
      ) as any;

      const members = await backendApi.getTeamMembers();
      expect(members.length).toBe(1);
      expect(members[0].name).toBe('Alice');

      let invitedRole = '';
      axios.post = mock((_url: string, body: any) => {
        invitedRole = body.role;
        return Promise.resolve({ data: { success: true } });
      }) as any;

      await backendApi.inviteTeamMember('bob@corp.com', 'EDITOR');
      expect(invitedRole).toBe('EDITOR');
    });

    it('fetches billing usage details', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            usage: {
              planTier: 'Enterprise',
              amount: 199,
              interval: 'monthly',
              renewsAt: 'Nov 1, 2026',
              paymentMethodMasked: 'Mastercard ending in 9999',
              ai_posts: { current: 50, limit: 500 },
              ai_tokens: { current: 100000, limit: 5000000 },
              storage_gb: { current: 5, limit: 50 },
            },
          },
        })
      ) as any;

      const billing = await backendApi.getBillingDetails();
      expect(billing.planTier).toBe('Enterprise');
      expect(billing.usage.postsLimit).toBe(500);
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

  describe('Image & Video Studio Generation', () => {
    it('generates multi-aspect diffusion images', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            imageUrl: 'https://images.unsplash.com/photo-test',
            id: 'img_test_1',
          },
        })
      ) as any;

      const img = await backendApi.generateImage('Test prompt', '16:9', 'Photorealistic');
      expect(img.id).toBe('img_test_1');
      expect(img.imageUrl).toBe('https://images.unsplash.com/photo-test');
      expect(img.aspectRatio).toBe('16:9');
    });

    it('generates multi-scene RAG video storyboards', async () => {
      axios.post = mock(() =>
        Promise.resolve({
          data: {
            success: true,
            result: {
              id: 'vid_test_1',
              title: 'Test Video',
              scenes: [
                { sceneNumber: 1, title: 'Scene 1', narrative: 'Script 1', visual: 'Cue 1', durationSeconds: 5 },
                { sceneNumber: 2, title: 'Scene 2', narrative: 'Script 2', visual: 'Cue 2', durationSeconds: 6 },
              ],
            },
          },
        })
      ) as any;

      const vid = await backendApi.generateVideoStoryboard('Test Video', 'Concept...', 'Professional');
      expect(vid.id).toBe('vid_test_1');
      expect(vid.scenes.length).toBe(2);
      expect(vid.totalDurationSeconds).toBe(11);
    });
  });

  describe('Workflows & Media Gallery Endpoints', () => {
    it('fetches live media gallery assets', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: [
            { id: 'img_live_1', imageUrl: 'https://s3.amazonaws.com/live.jpg', prompt: 'Brand asset', size: 1024, format: 'jpg' },
          ],
        })
      ) as any;

      const assets = await backendApi.getMediaAssets();
      expect(assets.length).toBe(1);
      expect(assets[0].id).toBe('img_live_1');
      expect(assets[0].url).toBe('https://s3.amazonaws.com/live.jpg');
      expect(assets[0].type).toBe('image');
    });

    it('fetches and approves live workflow approval drafts', async () => {
      axios.get = mock(() =>
        Promise.resolve({
          data: {
            drafts: [
              { id: 'wf_draft_1', title: 'Q3 Product Launch', status: 'PENDING_REVIEW', platforms: ['LINKEDIN'] },
            ],
          },
        })
      ) as any;

      const drafts = await backendApi.getWorkflows();
      expect(drafts.length).toBe(1);
      expect(drafts[0].id).toBe('wf_draft_1');
      expect(drafts[0].status).toBe('PENDING_REVIEW');

      let approvedPayload: any = null;
      axios.post = mock((_url: string, body: any) => {
        approvedPayload = body;
        return Promise.resolve({ data: { success: true } });
      }) as any;

      await backendApi.approveWorkflowDraft('wf_draft_1', 'Looks great, approved.');
      expect(approvedPayload.action).toBe('approve');
      expect(approvedPayload.comment).toBe('Looks great, approved.');
    });

    it('creates API key and webhook via backendApi', async () => {
      axios.post = mock((url: string, body: any) => {
        if (url.includes('api-keys')) {
          return Promise.resolve({ data: { id: 'key_1', name: body.name, key: 'sai_live_key_99999' } });
        }
        if (url.includes('webhooks')) {
          return Promise.resolve({ data: { id: 'wh_1', url: body.url, events: body.events } });
        }
        return Promise.resolve({ data: {} });
      }) as any;

      const key = await backendApi.createApiKey('My Live Key', ['*']);
      expect(key.name).toBe('My Live Key');
      expect(key.fullKey).toBe('sai_live_key_99999');

      const hook = await backendApi.createWebhook('Slack Hook', 'https://hooks.slack.com/123', ['post.published']);
      expect(hook.url).toBe('https://hooks.slack.com/123');
      expect(hook.eventTypes).toEqual(['post.published']);
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

  describe('Theme Mode & Dark/Light Switcher', () => {
    it('switches between light, dark, and system modes dynamically', async () => {
      await useAuthStore.getState().setThemeMode('light');
      expect(useAuthStore.getState().themeMode).toBe('light');

      await useAuthStore.getState().setThemeMode('dark');
      expect(useAuthStore.getState().themeMode).toBe('dark');

      await useAuthStore.getState().setThemeMode('system');
      expect(useAuthStore.getState().themeMode).toBe('system');
    });
  });
});