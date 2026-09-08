export type DMPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN';

export interface AutoReplyRule {
  id: string;
  businessId: string;
  name: string;
  platform: DMPlatform;
  triggerKeywords: string[];
  replyTemplate: string;
  aiEnhance: boolean;
  bookMeetingLink?: string;
  isActive: boolean;
  triggerCount: number;
  createdAt: string;
}

export interface SimulateDMInput {
  businessId: string;
  platform: DMPlatform;
  senderName: string;
  messageText: string;
}

export interface SimulateDMResponse {
  replyText: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  intent: 'LEAD_INQUIRY' | 'SUPPORT_QUESTION' | 'PRICING' | 'MEETING_REQUEST' | 'GENERAL';
  confidenceScore: number;
  isAiSynthesized: boolean;
  recommendedAction: string;
}
