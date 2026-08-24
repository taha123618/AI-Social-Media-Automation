import { SchedulingService } from '../scheduling.service';
import prisma from '@/lib/prisma';
import { RecurrenceType } from '@/app/generated/prisma/enums';

jest.mock('@/lib/prisma', () => {
  const contentScheduleRecurrence = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const client = { contentScheduleRecurrence };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    contentScheduleRecurrence,
  };
});

jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('SchedulingService', () => {
  const businessId = 'biz_scheduler_test';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setScheduleRecurrence', () => {
    it('creates new schedule recurrence when none exists', async () => {
      (prisma.contentScheduleRecurrence.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.contentScheduleRecurrence.create as jest.Mock).mockResolvedValue({
        id: 'rec_1',
        businessId,
        recurrenceType: RecurrenceType.DAILY,
      });

      const result = await SchedulingService.setScheduleRecurrence(businessId, {
        recurrenceType: RecurrenceType.DAILY,
        recurrencePattern: { times: ['09:00', '15:00'] },
        startDate: new Date(),
        timezone: 'UTC',
      });

      expect(result.id).toBe('rec_1');
      expect(prisma.contentScheduleRecurrence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            businessId,
            recurrenceType: RecurrenceType.DAILY,
          }),
        })
      );
    });

    it('updates existing schedule recurrence when one exists', async () => {
      (prisma.contentScheduleRecurrence.findFirst as jest.Mock).mockResolvedValue({
        id: 'rec_existing',
        businessId,
      });
      (prisma.contentScheduleRecurrence.update as jest.Mock).mockResolvedValue({
        id: 'rec_existing',
        recurrenceType: RecurrenceType.WEEKLY,
      });

      const result = await SchedulingService.setScheduleRecurrence(businessId, {
        recurrenceType: RecurrenceType.WEEKLY,
        recurrencePattern: { days: ['MONDAY', 'WEDNESDAY'] },
        startDate: new Date(),
      });

      expect(result.id).toBe('rec_existing');
      expect(prisma.contentScheduleRecurrence.update).toHaveBeenCalledWith({
        where: { id: 'rec_existing' },
        data: expect.objectContaining({
          recurrenceType: RecurrenceType.WEEKLY,
        }),
      });
    });
  });
});
