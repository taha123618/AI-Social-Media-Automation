import { addDays, isWithinInterval } from 'date-fns';
import { ContentIntent, Platform, RecurrenceType } from '@/app/generated/prisma/enums';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { KnowledgeService } from '@/features/knowledge/services/knowledge.service';

export interface SchedulingOptions {
  postsPerDay: number;
  timeZones: string[];
  optimalTimes: { [key: string]: number[] }; // Platform -> Array of hours (0-23)
  blackoutPeriods: Array<{ start: Date; end: Date }>;
  minIntervalBetweenPosts: number; // minutes
}

export interface ScheduledPost {
  draftId: string;
  businessId: string;
  platform: Platform;
  scheduledTime: Date;
  intent: ContentIntent;
}

export class SchedulingService {
  private static DEFAULT_OPTIONS: Partial<SchedulingOptions> = {
    postsPerDay: 3,
    timeZones: ['America/New_York', 'Europe/London'],
    optimalTimes: {
      LINKEDIN: [9, 12, 15], // 9 AM, 12 PM, 3 PM
      TWITTER: [8, 12, 17], // 8 AM, 12 PM, 5 PM
      INSTAGRAM: [11, 14, 19], // 11 AM, 2 PM, 7 PM
      FACEBOOK: [9, 13, 16], // 9 AM, 1 PM, 4 PM
      TIKTOK: [12, 19, 21], // 12 PM, 7 PM, 9 PM
      YOUTUBE: [10, 14, 18], // 10 AM, 2 PM, 6 PM
    },
    minIntervalBetweenPosts: 120, // 2 hours
  };

  /**
   * Set or update content schedule recurrence rule for a business
   */
  static async setScheduleRecurrence(
    businessId: string,
    data: {
      recurrenceType: RecurrenceType;
      recurrencePattern: any;
      startDate: Date;
      endDate?: Date;
      timezone?: string;
      autoOptimize?: boolean;
    }
  ) {
    const existing = await prisma.contentScheduleRecurrence.findFirst({
      where: { businessId }
    });

    if (existing) {
      return await prisma.contentScheduleRecurrence.update({
        where: { id: existing.id },
        data: {
          recurrenceType: data.recurrenceType,
          recurrencePattern: data.recurrencePattern,
          startDate: data.startDate,
          endDate: data.endDate,
          timezone: data.timezone || "UTC",
          autoOptimize: data.autoOptimize !== undefined ? data.autoOptimize : true
        }
      });
    }

    return await prisma.contentScheduleRecurrence.create({
      data: {
        businessId,
        recurrenceType: data.recurrenceType,
        recurrencePattern: data.recurrencePattern,
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: data.timezone || "UTC",
        autoOptimize: data.autoOptimize !== undefined ? data.autoOptimize : true
      }
    });
  }

  /**
   * Get active recurrence rules for a business
   */
  static async getScheduleRecurrence(businessId: string) {
    return await prisma.contentScheduleRecurrence.findFirst({
      where: { businessId, isActive: true }
    });
  }

  static async calculateOptimalSchedule(
    businessId: string,
    drafts: Array<{ id: string; platforms: Platform[]; intent: ContentIntent }>,
    options: Partial<SchedulingOptions> = {},
    startDate: Date = new Date(),
    endDate: Date = addDays(new Date(), 7)
  ): Promise<ScheduledPost[]> {
    const schedulingOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const scheduledPosts: ScheduledPost[] = [];

    // Get business's scheduling preferences
    await prisma.business.findUnique({
      where: { id: businessId },
      include: { profile: true },
    });

    // Group posts by platform for better distribution
    const postsByPlatform = this.groupPostsByPlatform(drafts);

    // Calculate available time slots
    const availableSlots = this.calculateAvailableSlots(
      startDate,
      endDate,
      schedulingOptions
    );

    // Distribute posts across available slots
    for (const [platform, platformDrafts] of Object.entries(postsByPlatform)) {
      const platformSlots = availableSlots.filter(slot =>
        this.isOptimalTimeForPlatform(slot.time, platform as Platform, schedulingOptions)
      );

      const platformScheduledPosts = await this.distributePostsAcrossSlots(
        platformDrafts,
        platformSlots,
        platform as Platform,
        businessId
      );

      scheduledPosts.push(...platformScheduledPosts);
    }

    // Sort by scheduled time
    scheduledPosts.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    return scheduledPosts;
  }

  private static groupPostsByPlatform(
    drafts: Array<{ id: string; platforms: Platform[]; intent: ContentIntent }>
  ): { [platform: string]: Array<{ id: string; intent: ContentIntent }> } {
    const grouped: { [platform: string]: Array<{ id: string; intent: ContentIntent }> } = {};

    for (const draft of drafts) {
      for (const platform of draft.platforms) {
        if (!grouped[platform]) {
          grouped[platform] = [];
        }
        grouped[platform].push({ id: draft.id, intent: draft.intent });
      }
    }

    return grouped;
  }

  private static calculateAvailableSlots(
    startDate: Date,
    endDate: Date,
    options: Partial<SchedulingOptions>
  ): Array<{ time: Date; available: boolean }> {
    const slots: Array<{ time: Date; available: boolean }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
          const slotTime = new Date(current);
          slotTime.setHours(hour, minute, 0, 0);

          // Check if slot is during blackout period
          const isBlackout = options.blackoutPeriods?.some(period =>
            isWithinInterval(slotTime, { start: period.start, end: period.end })
          );

          // Check if slot is in the past
          const isPast = slotTime < new Date();

          slots.push({
            time: slotTime,
            available: !isBlackout && !isPast,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  private static isOptimalTimeForPlatform(
    time: Date,
    platform: Platform,
    options: Partial<SchedulingOptions>
  ): boolean {
    const optimalTimes = options.optimalTimes?.[platform] || [];
    const hour = time.getHours();

    return optimalTimes.includes(hour);
  }

  private static async distributePostsAcrossSlots(
    posts: Array<{ id: string; intent: ContentIntent }>,
    slots: Array<{ time: Date; available: boolean }>,
    platform: Platform,
    businessId: string
  ): Promise<ScheduledPost[]> {
    const scheduled: ScheduledPost[] = [];
    const availableSlots = slots.filter(slot => slot.available);

    // Sort posts by intent priority
    const prioritizedPosts = this.prioritizePostsByIntent(posts);

    let lastScheduledTime: Date | null = null;
    
    // Frequency spreading track map: dateString -> scheduled count for this platform
    const postsScheduledOnDay: { [dateStr: string]: number } = {};

    let slotIndex = 0;
    for (const post of prioritizedPosts) {
      if (slotIndex >= availableSlots.length) break;

      let foundSlot = false;
      let checkIndex = slotIndex;

      // First pass: try to schedule respecting both min interval AND strict frequency spreading (1 post per platform per day max)
      while (checkIndex < availableSlots.length) {
        const slot = availableSlots[checkIndex];
        const dateStr = slot.time.toDateString();

        let respectsInterval = true;
        if (lastScheduledTime) {
          const timeDiff = Math.abs(slot.time.getTime() - lastScheduledTime.getTime());
          const minInterval = 2 * 60 * 60 * 1000; // 2 hours
          if (timeDiff < minInterval) {
            respectsInterval = false;
          }
        }

        const dayCount = postsScheduledOnDay[dateStr] || 0;
        const respectsSpreading = dayCount < 1;

        if (respectsInterval && respectsSpreading) {
          scheduled.push({
            draftId: post.id,
            businessId,
            platform,
            scheduledTime: slot.time,
            intent: post.intent,
          });

          postsScheduledOnDay[dateStr] = dayCount + 1;
          lastScheduledTime = slot.time;
          foundSlot = true;
          slotIndex = checkIndex + 1;
          break;
        }

        checkIndex++;
      }

      // Second pass: if no slot satisfies the strict frequency spread, fall back to any available slot respecting only min interval
      if (!foundSlot) {
        checkIndex = 0;
        while (checkIndex < availableSlots.length) {
          const slot = availableSlots[checkIndex];
          const dateStr = slot.time.toDateString();

          let respectsInterval = true;
          if (lastScheduledTime) {
            const timeDiff = Math.abs(slot.time.getTime() - lastScheduledTime.getTime());
            const minInterval = 2 * 60 * 60 * 1000;
            if (timeDiff < minInterval) {
              respectsInterval = false;
            }
          }

          const isPast = slot.time < new Date();
          const alreadyUsed = scheduled.some(s => s.scheduledTime.getTime() === slot.time.getTime());

          if (respectsInterval && !isPast && !alreadyUsed) {
            scheduled.push({
              draftId: post.id,
              businessId,
              platform,
              scheduledTime: slot.time,
              intent: post.intent,
            });

            postsScheduledOnDay[dateStr] = (postsScheduledOnDay[dateStr] || 0) + 1;
            lastScheduledTime = slot.time;
            slotIndex = checkIndex + 1;
            break;
          }
          checkIndex++;
        }
      }
    }

    // Retain vector logger logic as per original implementation plan requirements
    try {
      await KnowledgeService.searchKnowledgeChunks(
        businessId,
        "What is our brand voice?",
        3,
        0.60
      );
    } catch (e) {
      console.warn("RAG schedule telemetry logging skipped:", e);
    }

    return scheduled;
  }

  private static prioritizePostsByIntent(
    posts: Array<{ id: string; intent: ContentIntent }>
  ): Array<{ id: string; intent: ContentIntent }> {
    const priorityOrder = {
      SALES: 1,
      EVENT: 2,
      EDUCATION: 3,
      BRAND_AWARENESS: 4,
      ENGAGEMENT: 5,
    };

    return posts.sort((a, b) => priorityOrder[a.intent] - priorityOrder[b.intent]);
  }

  static async schedulePost(draftId: string, scheduledTime: Date): Promise<void> {
    // Update the draft in database
    await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        scheduledFor: scheduledTime,
        status: 'SCHEDULED',
      },
    });

    // Add to Redis sorted set for scheduling
    await redis.zAdd(
      'scheduled-posts',
      {
        score: scheduledTime.getTime(),
        value: draftId,
      }
    );

    console.log(`Scheduled draft ${draftId} for ${scheduledTime.toISOString()}`);
  }

  static async getScheduledPosts(): Promise<string[]> {
    const now = Date.now();

    // Get all posts scheduled for now or earlier
    const draftIds = await redis.zRangeByScore(
      'scheduled-posts',
      0,
      now,
      { LIMIT: { offset: 0, count: 100 } }
    ) as string[];

    return draftIds;
  }

  static async removeScheduledPost(draftId: string): Promise<void> {
    // Remove from Redis
    await redis.zRem('scheduled-posts', draftId);

    // Update database
    await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        scheduledFor: null,
        status: 'GENERATED',
      },
    });
  }

  static async reschedulePosts(
    businessId: string,
    newOptions: Partial<SchedulingOptions>
  ): Promise<ScheduledPost[]> {
    // Get all pending/scheduled drafts for the business
    const drafts = await prisma.contentDraft.findMany({
      where: {
        businessId,
        status: { in: ['GENERATED', 'SCHEDULED'] },
      },
      select: {
        id: true,
        platforms: true,
        intent: true,
      },
    });

    // Clear existing schedules
    for (const draft of drafts) {
      await this.removeScheduledPost(draft.id);
    }

    // Calculate new schedule
    const convertedDrafts = drafts.map(draft => ({
      ...draft,
      platforms: draft.platforms.map(p => p as Platform)
    }));
    return this.calculateOptimalSchedule(businessId, convertedDrafts, newOptions);
  }

  static async getSchedulingAnalytics(businessId: string, days: number = 30): Promise<{
    totalPosts: number;
    averagePostsPerDay: number;
    bestPerformingTimes: { hour: number; engagement: number }[];
    platformPerformance: { platform: Platform; posts: number; engagement: number }[];
  }> {
    const startDate = addDays(new Date(), -days);

    const posts = await prisma.post.findMany({
      where: {
        businessId,
        postedAt: { gte: startDate },
      }
    });

    const totalPosts = posts.length;
    const averagePostsPerDay = totalPosts / days;

    // Calculate best performing times
    const hourlyPerformance: { [hour: number]: { posts: number; totalEngagement: number } } = {};

    for (const post of posts) {
      if (!post.postedAt) continue;
      const hour = post.postedAt.getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { posts: 0, totalEngagement: 0 };
      }
      hourlyPerformance[hour].posts++;
      hourlyPerformance[hour].totalEngagement += post.likes || 0;
    }

    const bestPerformingTimes = Object.entries(hourlyPerformance)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        engagement: data.posts > 0 ? data.totalEngagement / data.posts : 0,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    // Calculate platform performance
    const platformStats: { [platform: string]: { posts: number; totalEngagement: number } } = {};

    for (const post of posts) {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = { posts: 0, totalEngagement: 0 };
      }
      platformStats[post.platform].posts++;
      platformStats[post.platform].totalEngagement += post.likes || 0;
    }

    const platformPerformance = Object.entries(platformStats).map(([platform, data]) => ({
      platform: platform as Platform,
      posts: data.posts,
      engagement: data.posts > 0 ? data.totalEngagement / data.posts : 0,
    }));

    return {
      totalPosts,
      averagePostsPerDay,
      bestPerformingTimes,
      platformPerformance,
    };
  }
}
