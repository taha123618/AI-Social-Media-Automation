export interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  platform?: string;
  intent?: string;
}

export interface ContentDraft {
  generatedContent: any;
  id: string;
  title: string | null;
  intent: 'SALES' | 'EDUCATION' | 'EVENT' | 'ENGAGEMENT' | 'BRAND_AWARENESS';
  platforms: ('LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE' | 'MASTODON' | 'BLUESKY' | 'PINTEREST' | 'GOOGLE_BUSINESS')[];
  customPrompt: string | null;
  content: string | null;
  contentJson: Record<string, unknown> | null;
  contextUsed: Record<string, unknown> | null;
  mediaUrl: string | null;
  status: 'GENERATED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'POSTED' | 'FAILED' | 'DRAFT';
  assetStatus: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | null;
  scheduledFor: Date | null;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  creatorId: string;
  executionId: string | null;
  workflowId: string | null;
  visualPrompt: string | null;
  videoScript: Record<string, unknown> | null;
  business: {
    id: string;
    name: string;
    slug: string;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  approvals: Array<{
    id: string;
    status: string;
    comment: string | null;
    reviewedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  posts: Array<{
    id: string;
    platform: string;
    externalPostId: string | null;
    postedAt: Date | null;
  }>;
  workflow?: {
    id: string;
    name: string;
  } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContentsResponse {
  contents: ContentDraft[];
  pagination: Pagination;
}
