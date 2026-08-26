'use client';

import { X, Calendar as CalendarIcon, Clock, Loader2, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ContentDraft } from '../types';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { updateSchedule } from '../actions/mutations';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScheduleContentModalProps {
  content: ContentDraft;
  onClose: () => void;
}

const QUICK_TIMES = [
  { label: 'Morning', time: '09:00' },
  { label: 'Afternoon', time: '14:00' },
  { label: 'Peak Evening', time: '18:30' },
];

export function ScheduleContentModal({ content, onClose }: ScheduleContentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [dates, setDates] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isToday = () => {
    const today = startOfToday();
    return isSameDay(selectedDate, today);
  };

  const getMinTime = () => {
    if (!isToday()) return '00:00';

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = (Math.floor(now.getMinutes() / 5) * 5 + 30).toString().padStart(2, '0');

    if (parseInt(minutes) >= 60) {
      const nextHour = (now.getHours() + 1).toString().padStart(2, '0');
      return `${nextHour}:00`;
    }

    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const nextDates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1));
    setDates(nextDates);

    if (content.scheduledFor) {
      const existing = new Date(content.scheduledFor);
      setSelectedDate(existing);
      setSelectedTime(format(existing, 'HH:mm'));
    } else {
      setSelectedDate(nextDates[0]);
    }
  }, [content.scheduledFor]);

  const handleSchedule = async () => {
    setIsSaving(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await updateSchedule(content.id, scheduledDate);
      toast.success('Content scheduled successfully');
      onClose();
    } catch {
      toast.error('Failed to schedule content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden text-foreground"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-28 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                Schedule Publication
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                {content.title || 'Untitled Post'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 relative z-10">
          {/* Horizontal Date Picker */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Select Target Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'flex flex-col items-center min-w-[62px] rounded-xl p-2.5 transition-all border text-center cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                        : 'border-border/70 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    <span className="text-[10px] font-mono font-semibold uppercase opacity-70" suppressHydrationWarning>
                      {format(date, 'EEE')}
                    </span>
                    <span className="text-base font-bold text-foreground" suppressHydrationWarning>
                      {format(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker & Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Select Publish Time</label>
            <div className="relative mb-2">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                min={getMinTime()}
                className="pl-9 h-10 text-xs rounded-xl bg-secondary/30 border-border/70 text-foreground focus-visible:ring-primary/30"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              {QUICK_TIMES.map((qt) => (
                <button
                  key={qt.time}
                  type="button"
                  onClick={() => setSelectedTime(qt.time)}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all text-center',
                    selectedTime === qt.time
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/60 bg-secondary/20 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-card/50 flex items-center justify-between shrink-0 relative z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs rounded-xl text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSchedule}
            disabled={isSaving}
            className="h-9 px-5 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Confirm Slot</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
