export interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
  view?: 'calendar' | 'list';
}

export interface ScheduledContent {
  id: string;
  title: string | null;
  intent: 'SALES' | 'EDUCATION' | 'EVENT' | 'ENGAGEMENT' | 'BRAND_AWARENESS';
  platforms: ('LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE')[];
  status: 'SCHEDULED' | 'POSTED' | 'FAILED';
  scheduledFor: Date | null;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  creatorId: string;
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
  posts: Array<{
    id: string;
    platform: string;
    externalPostId: string | null;
    postedAt: Date | null;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ScheduledContentsResponse {
  scheduledContents: ScheduledContent[];
  pagination: Pagination;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  platforms: string[];
  status: string;
  content: ScheduledContent;
}
