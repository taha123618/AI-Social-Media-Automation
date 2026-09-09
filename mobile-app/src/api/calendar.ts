import { http } from './client';
import { CalendarSlot } from '@/types/api';

const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const calendarApi = {
  getCalendarSlots: async (): Promise<CalendarSlot[]> => {
    try {
      const res = await http.get<{ slots?: any[]; data?: { slots?: any[] } }>('/api/posting-schedule');
      const slots = res.slots || res.data?.slots;

      if (slots && Array.isArray(slots)) {
        return slots.map((s: any) => {
          const dayNum = DAY_MAP[s.dayOfWeek] ?? 1;
          const hour12 = s.hour % 12 || 12;
          const ampm = s.hour >= 12 ? 'PM' : 'AM';
          const minuteStr = s.minute < 10 ? `0${s.minute}` : `${s.minute}`;
          const timeStr = `${hour12 < 10 ? '0' + hour12 : hour12}:${minuteStr} ${ampm}`;

          return {
            id: s.id,
            dayOfWeek: dayNum,
            time: timeStr,
            platform: 'linkedin',
            isPeakHour: s.hour >= 8 && s.hour <= 10,
            engagementScore: s.hour >= 8 && s.hour <= 10 ? 94 : 85,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[CalendarAPI] Failed to fetch live posting schedule:', err);
      return [];
    }
  },
};
