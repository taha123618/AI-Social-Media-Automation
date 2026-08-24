export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger: {
    type: 'MANUAL' | 'SCHEDULED' | 'EVENT_BASED' | 'PHOTO_UPLOAD' | 'BEFORE_AFTER_UPLOAD';
    config: Record<string, unknown>;
  };
  steps: WorkflowStep[];
  isActive: boolean;
  runCount: number;
  successRate: string;
  lastRunAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  businessId: string;
  creatorId: string;
  comments?: WorkflowComment[];
  uploadConfig?: WorkflowUploadConfig | null;
  lastDraft?: {
    id: string;
    content: string | null;
    imageUrls: string[];
    createdAt: Date | string;
  } | null;
}

export interface WorkflowUploadConfig {
  id: string;
  workflowId: string;
  uploadCategory: 'JOB_PHOTO' | 'BEFORE_AFTER' | 'PRODUCT';
  autoCaption: boolean;
  autoSchedule: boolean;
  scheduleOffsetMinutes: number;
  platform: string;
}

export interface WorkflowTeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  name: string | null;
  email: string;
  image: string | null;
}

export interface WorkflowWithTeam extends Workflow {
  teamMembers: WorkflowTeamMember[];
  creatorName: string | null;
  creatorImage: string | null;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'CONTENT_GENERATION' | 'CONTENT_REVIEW' | 'CONTENT_SCHEDULING' | 'CONTENT_POSTING' | 'NOTIFICATION' | 'CUSTOM';
  config: Record<string, unknown>;
  order: number;
  conditions: Record<string, unknown>[];
}

export interface WorkflowComment {
  id: string;
  workflowId: string;
  author?: string;
  text: string;
  createdAt: Date | string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Omit<WorkflowStep, 'id'>[];
  icon: string;
  isPopular: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  result: Record<string, unknown> | null;
  triggerData: Record<string, unknown> | null;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  executionId: string;
  stepId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  result: Record<string, unknown> | null;
}

export interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}