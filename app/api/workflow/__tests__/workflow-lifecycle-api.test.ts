import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findUnique: jest.fn(),
  };
  const client = { businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
  };
});

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/features/workflow/services/workflow.service', () => ({
  WorkflowService: {
    submitForReview: jest.fn(),
    approveDraft: jest.fn(),
    rejectDraft: jest.fn(),
    scheduleDraft: jest.fn(),
  },
}));

jest.mock('@/features/scheduler/services/scheduler.service', () => ({
  SchedulerService: {
    schedulePost: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logError: jest.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { WorkflowService } from '@/features/workflow/services/workflow.service';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import { POST as submitRoute } from '../[draftId]/submit/route';
import { POST as approveRoute } from '../[draftId]/approve/route';
import { POST as rejectRoute } from '../[draftId]/reject/route';
import { POST as scheduleRoute } from '../[draftId]/schedule/route';

describe('Workflow Post Lifecycle State Machine API', () => {
  const mockUser = { id: 'usr_editor_1', email: 'editor@agency.com' };
  const draftId = 'draft_lifecycle_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Submit for Review (/api/workflow/[draftId]/submit)', () => {
    it('returns 401 Unauthorized when session is missing', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/submit`, {
        method: 'POST',
      });
      const res = await submitRoute(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('transitions draft to PENDING_REVIEW state for authenticated user', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (WorkflowService.submitForReview as jest.Mock).mockResolvedValue({
        id: draftId,
        status: 'PENDING_REVIEW',
        updatedAt: new Date(),
      });

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/submit`, {
        method: 'POST',
      });
      const res = await submitRoute(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('PENDING_REVIEW');
      expect(WorkflowService.submitForReview).toHaveBeenCalledWith(draftId, mockUser.id);
    });
  });

  describe('Approve Draft (/api/workflow/[draftId]/approve)', () => {
    it('approves draft with optional reviewer comment', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (WorkflowService.approveDraft as jest.Mock).mockResolvedValue({
        id: draftId,
        status: 'APPROVED',
      });

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Looks great for LinkedIn!' }),
      });
      const res = await approveRoute(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('APPROVED');
      expect(WorkflowService.approveDraft).toHaveBeenCalledWith(draftId, mockUser.id, 'Looks great for LinkedIn!');
    });
  });

  describe('Reject Draft (/api/workflow/[draftId]/reject)', () => {
    it('rejects draft and records explicit feedback reason', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (WorkflowService.rejectDraft as jest.Mock).mockResolvedValue({
        id: draftId,
        status: 'REJECTED',
      });

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Tone does not match brand guidelines.' }),
      });
      const res = await rejectRoute(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('REJECTED');
      expect(WorkflowService.rejectDraft).toHaveBeenCalledWith(
        draftId,
        mockUser.id,
        'Tone does not match brand guidelines.'
      );
    });

    it('returns 400 Validation Error if rejection reason is missing', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await rejectRoute(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Validation Error');
    });
  });

  describe('Schedule Draft (/api/workflow/[draftId]/schedule)', () => {
    it('schedules approved draft and triggers background BullMQ queueing', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      const targetDate = '2026-10-01T15:00:00.000Z';

      (WorkflowService.scheduleDraft as jest.Mock).mockResolvedValue({
        id: draftId,
        status: 'SCHEDULED',
        businessId: 'biz_1',
        platforms: ['LINKEDIN', 'TWITTER'],
      });
      (SchedulerService.schedulePost as jest.Mock).mockResolvedValue({ jobId: 'job_sched_1' });

      const req = new NextRequest(`http://localhost:3000/api/workflow/${draftId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: targetDate }),
      });
      const res = await scheduleRoute(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.draft.status).toBe('SCHEDULED');
      expect(json.message).toContain('Scheduled successfully');
      expect(WorkflowService.scheduleDraft).toHaveBeenCalledWith(draftId, mockUser.id, new Date(targetDate));
      expect(SchedulerService.schedulePost).toHaveBeenCalledTimes(2);
    });
  });
});
