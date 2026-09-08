export interface SentimentDistribution {
  positive: number; // percentage
  neutral: number;
  negative: number;
}

export interface BrandMentionItem {
  id: string;
  platform: 'TWITTER' | 'REDDIT' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE';
  author: string;
  authorHandle: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  engagementScore: number;
  url: string;
  timestamp: string;
  aiSuggestedAction?: string;
}

export interface CompetitorRadarItem {
  competitorName: string;
  shareOfVoice: number; // percentage
  weeklyPostCount: number;
  averageEngagement: number;
  topTrendingTopic: string;
  sentimentScore: number; // 0-100
}

export interface SocialListeningReport {
  businessId: string;
  overallSentimentScore: number; // 0-100
  totalMentionsTracked: number;
  sentimentDistribution: SentimentDistribution;
  mentions: BrandMentionItem[];
  competitors: CompetitorRadarItem[];
  trendingKeywords: { keyword: string; volume: number; sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }[];
  aiExecutiveSummary: string;
  generatedAt: string;
}
