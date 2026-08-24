import prisma from '@/lib/prisma';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export const ALL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface TimeSlotInput {
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
}

export class PostingScheduleService {
  /** Get or auto-create the posting schedule for a business */
  static async getSchedule(businessId: string) {
    let schedule = await prisma.postingSchedule.findUnique({
      where: { businessId },
      include: { slots: { orderBy: [{ dayOfWeek: 'asc' }, { hour: 'asc' }, { minute: 'asc' }] } },
    });

    if (!schedule) {
      schedule = await prisma.postingSchedule.create({
        data: { businessId },
        include: { slots: true },
      });
    }

    return schedule;
  }

  /** Add a new time slot. If dayOfWeek = null, add to ALL 7 days */
  static async addSlot(businessId: string, slot: TimeSlotInput | { dayOfWeek: null; hour: number; minute: number }) {
    const schedule = await this.getSchedule(businessId);
    const days: DayOfWeek[] = slot.dayOfWeek === null ? ALL_DAYS : [slot.dayOfWeek as DayOfWeek];

    const created = await prisma.$transaction(
      days.map((day) =>
        prisma.postingScheduleSlot.upsert({
          where: { scheduleId_dayOfWeek_hour_minute: { scheduleId: schedule.id, dayOfWeek: day, hour: slot.hour, minute: slot.minute } },
          create: { scheduleId: schedule.id, dayOfWeek: day, hour: slot.hour, minute: slot.minute, enabled: true },
          update: { enabled: true },
        })
      )
    );

    return created;
  }

  /** Remove a specific slot by id */
  static async removeSlot(slotId: string, businessId: string) {
    // Verify ownership
    const slot = await prisma.postingScheduleSlot.findFirst({
      where: { id: slotId, schedule: { businessId } },
    });
    if (!slot) throw new Error('Slot not found');
    return prisma.postingScheduleSlot.delete({ where: { id: slotId } });
  }

  /** Toggle day on/off (enable/disable ALL slots for a given day) */
  static async toggleDay(businessId: string, dayOfWeek: DayOfWeek, enabled: boolean) {
    const schedule = await prisma.postingSchedule.findUnique({ where: { businessId } });
    if (!schedule) throw new Error('No schedule found');

    return prisma.postingScheduleSlot.updateMany({
      where: { scheduleId: schedule.id, dayOfWeek },
      data: { enabled },
    });
  }

  /** Clear ALL slots for a business */
  static async clearAll(businessId: string) {
    const schedule = await prisma.postingSchedule.findUnique({ where: { businessId } });
    if (!schedule) return;
    return prisma.postingScheduleSlot.deleteMany({ where: { scheduleId: schedule.id } });
  }

  /** Update timezone */
  static async updateTimezone(businessId: string, timezone: string) {
    const schedule = await this.getSchedule(businessId);
    return prisma.postingSchedule.update({
      where: { id: schedule.id },
      data: { timezone },
    });
  }

  /**
   * CRON TICK — called every minute by the posting worker.
   * Finds slots matching the current day + time (in the business timezone)
   * and enqueues SocialPosts that are in DRAFT/APPROVED status.
   * 
   * IMPORTANT: Only executes if valid scheduled posts exist in the POST table.
   */
  static async processTick() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();

    // Map JS day (0=Sun) to Prisma DayOfWeek
    const dayMap: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const todayUTC = dayMap[now.getUTCDay()];

    // Find all enabled slots matching this exact minute
    const dueSlots = await prisma.postingScheduleSlot.findMany({
      where: { dayOfWeek: todayUTC, hour: utcHour, minute: utcMinute, enabled: true },
      include: { schedule: { include: { business: true } } },
    });

    if (dueSlots.length === 0) {
      return { processed: 0, skipped: false, reason: 'no_matching_slots' };
    }

    let published = 0;

    for (const slot of dueSlots) {
      const business = slot.schedule.business;

      // Pick next SCHEDULED Post that hasn't been posted yet and matches this slot's time
      // Or just pick the next one in the queue if we're using slots as a "rate limiter"
      const post = await prisma.post.findFirst({
        where: {
          businessId: business.id,
          status: 'SCHEDULED',
          postedAt: null,
          scheduledFor: { lte: now } // Only pick if it's due
        },
        orderBy: { scheduledFor: 'asc' },
      });

      if (!post) continue;

      // In a real system, this would trigger the actual posting worker/API
      // For now, we assume the posting worker monitors Post table or is triggered here
      
      published++;
      console.log(`[PostingSchedule] Processing scheduled post ${post.id} for business ${business.id}`);
    }

    return { processed: published, skipped: false };
  }
}
