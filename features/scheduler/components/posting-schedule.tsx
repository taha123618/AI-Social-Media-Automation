'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Info, Plus, Trash2, RotateCcw, Loader2, CalendarDays } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayOfWeek =
   | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'
   | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface Slot {
   id: string;
   dayOfWeek: DayOfWeek;
   hour: number;
   minute: number;
   enabled: boolean;
}

interface Schedule {
   id: string;
   timezone: string;
   slots: Slot[];
}

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT: Record<DayOfWeek, string> = {
   MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
   THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const TIMEZONES = [
   'Asia/Karachi', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
   'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo',
   'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(hour: number, minute: number): string {
   const h = hour % 12 || 12;
   const m = minute.toString().padStart(2, '0');
   const ampm = hour < 12 ? 'am' : 'pm';
   return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function isDayEnabled(slots: Slot[], day: DayOfWeek): boolean {
   const daySlots = slots.filter((s) => s.dayOfWeek === day);
   return daySlots.length > 0 && daySlots.some((s) => s.enabled);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface PostingScheduleProps {
   businessId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PostingSchedule({ businessId }: PostingScheduleProps) {
   const [schedule, setSchedule] = useState<Schedule | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [clearing, setClearing] = useState(false);

   // Add-slot form state
   const [selectedDay, setSelectedDay] = useState<'EVERYDAY' | DayOfWeek>('EVERYDAY');
   const [hour, setHour] = useState(6);
   const [minute, setMinute] = useState(30);

   // ── Fetch ──────────────────────────────────────────────────────────────────

   const fetchSchedule = useCallback(async () => {
      try {
         const res = await fetch('/api/posting-schedule', {
            headers: { 'x-business-id': businessId },
         });
         if (!res.ok) throw new Error(await res.text());
         const data = await res.json();
         setSchedule(data);
      } catch (err: any) {
         toast.error(err.message || 'Failed to load schedule');
      } finally {
         setLoading(false);
      }
   }, [businessId]);

   useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

   // ── Add slot ───────────────────────────────────────────────────────────────

   const handleAddSlot = async () => {
      setSaving(true);
      try {
         const res = await fetch('/api/posting-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
            body: JSON.stringify({
               dayOfWeek: selectedDay === 'EVERYDAY' ? null : selectedDay,
               hour,
               minute,
            }),
         });
         if (!res.ok) throw new Error((await res.json()).error);
         toast.success('Posting time added!');
         await fetchSchedule();
      } catch (err: any) {
         toast.error(err.message || 'Failed to add slot');
      } finally {
         setSaving(false);
      }
   };

   // ── Remove slot ────────────────────────────────────────────────────────────

   const handleRemoveSlot = async (slotId: string) => {
      try {
         const res = await fetch(`/api/posting-schedule/slots/${slotId}`, {
            method: 'DELETE',
            headers: { 'x-business-id': businessId },
         });
         if (!res.ok) throw new Error((await res.json()).error);
         setSchedule((prev) =>
            prev ? { ...prev, slots: prev.slots.filter((s) => s.id !== slotId) } : prev
         );
      } catch (err: any) {
         toast.error(err.message || 'Failed to remove slot');
      }
   };

   // ── Toggle day ─────────────────────────────────────────────────────────────

   const handleToggleDay = async (day: DayOfWeek, enabled: boolean) => {
      try {
         const res = await fetch(`/api/posting-schedule/slots/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
            body: JSON.stringify({ dayOfWeek: day, enabled }),
         });
         if (!res.ok) throw new Error((await res.json()).error);
         setSchedule((prev) =>
            prev
               ? { ...prev, slots: prev.slots.map((s) => s.dayOfWeek === day ? { ...s, enabled } : s) }
               : prev
         );
      } catch (err: any) {
         toast.error(err.message || 'Failed to toggle day');
      }
   };

   // ── Clear all ──────────────────────────────────────────────────────────────

   const handleClearAll = async () => {
      setClearing(true);
      try {
         const res = await fetch('/api/posting-schedule', {
            method: 'DELETE',
            headers: { 'x-business-id': businessId },
         });
         if (!res.ok) throw new Error((await res.json()).error);
         setSchedule((prev) => prev ? { ...prev, slots: [] } : prev);
         toast.success('All posting times cleared');
      } catch (err: any) {
         toast.error(err.message || 'Failed to clear');
      } finally {
         setClearing(false);
      }
   };

   // ── Loading state ──────────────────────────────────────────────────────────

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   const slots = schedule?.slots ?? [];

   // ── Render ─────────────────────────────────────────────────────────────────

   return (
      <div className="space-y-8 max-w-5xl">

         {/* Header */}
         <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
               <CalendarDays className="h-6 w-6 text-primary" />
               Posting Schedule
            </h2>
            <p className="text-sm text-muted-foreground">
               Your posting schedule tells the system when to send posts to the queue.
            </p>
         </div>

         {/* Add new posting time card */}
         <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Add new posting time</p>

            <div className="flex flex-wrap items-center gap-3">
               {/* Day selector */}
               <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as 'EVERYDAY' | DayOfWeek)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
               >
                  <option value="EVERYDAY">Everyday</option>
                  {DAYS.map((d) => (
                     <option key={d} value={d}>{DAY_SHORT[d]}</option>
                  ))}
               </select>

               <span className="text-sm text-muted-foreground font-medium">Time</span>

               {/* Hour */}
               <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour.toString().padStart(2, '0')}
                  onChange={(e) => setHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                  className="w-14 h-10 text-center rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
               />
               <span className="text-muted-foreground font-bold">:</span>
               {/* Minute */}
               <input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={minute.toString().padStart(2, '0')}
                  onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="w-14 h-10 text-center rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
               />
               <span className="text-sm text-muted-foreground">
                  {hour < 12 ? 'AM' : 'PM'}
               </span>

               <Button
                  onClick={handleAddSlot}
                  disabled={saving}
                  className="h-10 px-5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
               >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  ADD POSTING TIME
               </Button>
            </div>

            {/* Timezone info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Clock className="h-3.5 w-3.5" />
               <span>{schedule?.timezone ?? 'UTC'}</span>
               <span title="Times are stored in UTC and compared to your business timezone." className="cursor-help">
                  <Info className="h-3.5 w-3.5" />
               </span>
            </div>
         </div>

         {/* Posting times grid */}
         <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
               <div>
                  <h3 className="text-base font-bold">Posting times</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                     Your posting schedule tells the system when to send posts to the queue.
                  </p>
               </div>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={clearing || slots.length === 0}
                  className="h-9 px-4 text-xs font-bold border-border rounded-lg"
               >
                  {clearing ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <RotateCcw className="h-3 w-3 mr-1.5" />}
                  CLEAR ALL POSTING TIMES
               </Button>
            </div>

            {slots.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Clock className="h-10 w-10 opacity-30" />
                  <p className="text-sm">No posting times added yet. Add your first one above.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-border">
                  {DAYS.map((day) => {
                     const daySlots = slots.filter((s) => s.dayOfWeek === day);
                     const enabled = isDayEnabled(slots, day);

                     return (
                        <div key={day} className="flex flex-col min-h-[180px]">
                           {/* Day header */}
                           <div className="px-3 pt-4 pb-2 border-b border-border/50">
                              <p className="text-xs font-bold text-center text-foreground mb-2">
                                 {DAY_SHORT[day]}
                              </p>
                              <div className="flex items-center justify-center gap-1.5">
                                 <span className="text-[11px] text-muted-foreground">On</span>
                                 <Switch
                                    checked={enabled}
                                    onCheckedChange={(val: boolean) => handleToggleDay(day, val)}
                                    className="scale-75"
                                 />
                              </div>
                           </div>

                           {/* Slots */}
                           <div className="flex flex-col gap-0.5 p-2 flex-1">
                              {daySlots.length === 0 ? (
                                 <p className="text-[10px] text-muted-foreground text-center pt-4 opacity-50">—</p>
                              ) : (
                                 daySlots.map((slot) => (
                                    <div
                                       key={slot.id}
                                       className={`group flex items-center justify-between px-2 py-1 rounded-md cursor-default transition-colors ${slot.enabled
                                             ? 'text-primary hover:bg-primary/5'
                                             : 'text-muted-foreground/50 line-through hover:bg-muted/20'
                                          }`}
                                    >
                                       <span className="text-[11px] font-semibold tabular-nums">
                                          {formatTime(slot.hour, slot.minute)}
                                       </span>
                                       <button
                                          onClick={() => handleRemoveSlot(slot.id)}
                                          className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity p-0.5 rounded"
                                          title="Remove"
                                       >
                                          <Trash2 className="h-3 w-3" />
                                       </button>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Update button */}
         {slots.length > 0 && (
            <div className="flex items-center gap-4">
               <Button
                  className="h-11 px-8 rounded-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  onClick={() => toast.success('Posting schedule saved!')}
               >
                  UPDATE POSTING TIMES
               </Button>
               <p className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-1.5 text-emerald-500 border-emerald-500/30">
                     {slots.filter((s) => s.enabled).length} active
                  </Badge>
                  time slots across {DAYS.filter((d) => slots.some((s) => s.dayOfWeek === d && s.enabled)).length} days
               </p>
            </div>
         )}
      </div>
   );
}
