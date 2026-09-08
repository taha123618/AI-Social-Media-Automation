import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findFirst: jest.fn(),
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

jest.mock('@/features/scheduler/services/posting-schedule.service', () => ({
  PostingScheduleService: {
    getSchedule: jest.fn(),
    addSlot: jest.fn(),
    removeSlot: jest.fn(),
    toggleDay: jest.fn(),
    clearAll: jest.fn(),
    updateTimezone: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import { GET, POST, DELETE, PATCH } from '../route';
import { PATCH as toggleDayPatch } from '../slots/toggle/route';
import { DELETE as removeSlotDelete } from '../slots/[slotId]/route';

describe('Posting Schedule API (/api/posting-schedule)', () => {
  const mockUser = { id: 'usr_sched_1', email: 'scheduler@brand.com' };
  const businessId = 'biz_sched_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Tenant Authorization Gates', () => {
    it('returns 401 Unauthorized if user is not signed in', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        headers: { 'x-business-id': businessId },
      });
      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 400 Bad Request if x-business-id header is missing', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = new NextRequest('http://localhost:3000/api/posting-schedule');
      const res = await GET(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Missing x-business-id');
    });

    it('returns 403 Forbidden if user is not a verified business member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        headers: { 'x-business-id': businessId },
      });
      const res = await GET(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Forbidden');
    });
  });

  describe('Schedule Operations (GET, POST, PATCH, DELETE)', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
    });

    it('fetches existing schedule configuration for member', async () => {
      (PostingScheduleService.getSchedule as jest.Mock).mockResolvedValue({
        timezone: 'America/New_York',
        slots: [{ id: 'slot_1', dayOfWeek: 'MONDAY', hour: 9, minute: 0 }],
      });

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        headers: { 'x-business-id': businessId },
      });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.timezone).toBe('America/New_York');
      expect(json.slots.length).toBe(1);
    });

    it('adds a new posting time slot with 201 Created', async () => {
      (PostingScheduleService.addSlot as jest.Mock).mockResolvedValue({
        id: 'slot_new_1',
        dayOfWeek: 'WEDNESDAY',
        hour: 14,
        minute: 30,
      });

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        method: 'POST',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: 'WEDNESDAY', hour: 14, minute: 30 }),
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('slot_new_1');
      expect(PostingScheduleService.addSlot).toHaveBeenCalledWith(businessId, {
        dayOfWeek: 'WEDNESDAY',
        hour: 14,
        minute: 30,
      });
    });

    it('rejects POST with 400 when hour or minute is omitted', async () => {
      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        method: 'POST',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: 'WEDNESDAY' }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('hour and minute are required');
    });

    it('updates organization posting timezone via PATCH', async () => {
      (PostingScheduleService.updateTimezone as jest.Mock).mockResolvedValue({
        timezone: 'Europe/London',
      });

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        method: 'PATCH',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'Europe/London' }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      expect(PostingScheduleService.updateTimezone).toHaveBeenCalledWith(businessId, 'Europe/London');
    });

    it('clears all slots via DELETE with verified membership', async () => {
      (PostingScheduleService.clearAll as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/posting-schedule', {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const res = await DELETE(req);

      expect(res.status).toBe(200);
      expect(PostingScheduleService.clearAll).toHaveBeenCalledWith(businessId);
    });

    it('toggles a whole day on/off via /slots/toggle', async () => {
      (PostingScheduleService.toggleDay as jest.Mock).mockResolvedValue({ success: true, count: 4 });

      const req = new NextRequest('http://localhost:3000/api/posting-schedule/slots/toggle', {
        method: 'PATCH',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: 'FRIDAY', enabled: false }),
      });
      const res = await toggleDayPatch(req);

      expect(res.status).toBe(200);
      expect(PostingScheduleService.toggleDay).toHaveBeenCalledWith(businessId, 'FRIDAY', false);
    });

    it('removes a specific slot via /slots/[slotId]', async () => {
      (PostingScheduleService.removeSlot as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/posting-schedule/slots/slot_789', {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const res = await removeSlotDelete(req, { params: Promise.resolve({ slotId: 'slot_789' }) });

      expect(res.status).toBe(200);
      expect(PostingScheduleService.removeSlot).toHaveBeenCalledWith('slot_789', businessId);
    });
  });
});
