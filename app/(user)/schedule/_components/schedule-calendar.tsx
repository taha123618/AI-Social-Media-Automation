'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Clock, Calendar as CalendarIcon, MoreHorizontal, TrendingUp, Lightbulb, Plus } from 'lucide-react';
import { ScheduledContent, SearchParams } from '../types';
import { ScheduledContentModal } from './scheduled-content-modal';
import { TimeSelectionModal } from './time-selection-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ScheduleCalendarProps {
  scheduledContents: ScheduledContent[];
  currentParams: SearchParams;
}

export function ScheduleCalendar({ scheduledContents }: ScheduleCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'FAILED':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'SCHEDULED':
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getContentsForDate = (date: Date) => {
    if (!scheduledContents || !Array.isArray(scheduledContents)) {
      return [];
    }
    return scheduledContents.filter(content => {
      if (!content.scheduledFor) return false;
      return isSameDay(new Date(content.scheduledFor), date);
    });
  };

  const getBestPostingTimes = (date: Date) => {
    return isWeekend(date) ? ['10:00 AM', '2:00 PM'] : ['9:00 AM', '1:00 PM'];
  };

  const getEngagementPrediction = (date: Date) => {
    const contents = getContentsForDate(date);
    if (contents.length === 0) return null;
    const baseScore = 78;
    const timeBonus = isWeekend(date) ? -4 : 8;
    const contentBonus = contents.length * 2;
    return Math.min(96, baseScore + timeBonus + contentBonus);
  };

  const handleDateTimeSelect = (date: Date, time?: string) => {
    let selectedDateTime = date;
    if (time) {
      const [hoursStr, minutesStr] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      selectedDateTime = new Date(date);
      selectedDateTime.setHours(hours, minutes, 0, 0);
    }
    const formattedDateTime = selectedDateTime.toISOString();
    router.push(`/posts/create?scheduledFor=${encodeURIComponent(formattedDateTime)}`);
  };

  const handleDayClick = (day: Date) => {
    if (isPastDate(day)) return;
    setSelectedDate(day);
    const dayContents = getContentsForDate(day);
    if (dayContents.length === 0) {
      setSelectedDateForTime(day);
      setShowTimeModal(true);
    }
  };

  const [today] = useState(() => new Date());

  const isPastDate = (date: Date) => {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    return dateStart < todayStart;
  };

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const totalContentCount = scheduledContents?.length || 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* Calendar Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 border-b border-border/70 bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground" suppressHydrationWarning>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {totalContentCount} scheduled releases this period
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="h-8 px-3 text-xs font-semibold rounded-lg"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border/70 bg-secondary/30 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2.5 text-[11px] font-mono font-semibold uppercase text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-border/60">
        {monthDays.map((day, index) => {
          const dayContents = getContentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isPast = isPastDate(day);
          const prediction = getEngagementPrediction(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                'group relative min-h-[110px] sm:min-h-[140px] p-2 sm:p-2.5 bg-card transition-colors flex flex-col justify-between cursor-pointer',
                !isCurrentMonth && 'opacity-30 pointer-events-none bg-secondary/20',
                isSelected && 'ring-2 ring-primary bg-primary/5',
                isPast && 'opacity-40 cursor-not-allowed pointer-events-none'
              )}
            >
              {/* Day Number and Badges */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'h-6 w-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all',
                    isToday
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground group-hover:text-primary'
                  )}
                  suppressHydrationWarning
                >
                  {format(day, 'd')}
                </span>

                {prediction && (
                  <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                    <TrendingUp className="h-2 w-2 mr-0.5" />
                    {prediction}%
                  </Badge>
                )}
              </div>

              {/* Day Contents */}
              <div className="space-y-1.5 flex-1">
                {dayContents.slice(0, 2).map((content) => (
                  <div
                    key={content.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContent(content);
                    }}
                    className={cn(
                      'p-1.5 rounded-lg text-[11px] font-medium border truncate transition-all flex items-center gap-1.5 cursor-pointer',
                      getStatusBadge(content.status)
                    )}
                  >
                    <span className="truncate">{content.title || 'Untitled Draft'}</span>
                  </div>
                ))}

                {dayContents.length > 2 && (
                  <div className="text-[10px] font-mono font-bold text-muted-foreground text-center py-0.5">
                    +{dayContents.length - 2} more
                  </div>
                )}

                {/* Quick Add Button */}
                {dayContents.length === 0 && !isPast && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDateForTime(day);
                      setShowTimeModal(true);
                    }}
                    className="w-full py-1 rounded-md border border-dashed border-border/80 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Slot</span>
                  </button>
                )}
              </div>

              {/* Best Time hint */}
              {dayContents.length > 0 && (
                <div className="text-[9px] font-mono text-muted-foreground pt-1 truncate">
                  Peak: {getBestPostingTimes(day)[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedContent && (
        <ScheduledContentModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {showTimeModal && selectedDateForTime && (
        <TimeSelectionModal
          isOpen={showTimeModal}
          onClose={() => setShowTimeModal(false)}
          selectedDate={selectedDateForTime}
          onTimeSelect={(date, time) => handleDateTimeSelect(date, time)}
        />
      )}
    </div>
  );
}
