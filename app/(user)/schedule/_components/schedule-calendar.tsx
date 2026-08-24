'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isWeekend, addHours, setMinutes, setSeconds, setHours } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Clock, Calendar as CalendarIcon, MoreHorizontal, Zap, TrendingUp, Brain, Lightbulb, Plus } from 'lucide-react';
import { ScheduledContent, SearchParams } from '../types';
import { ScheduledContentModal } from './scheduled-content-modal';
import { TimeSelectionModal } from './time-selection-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ScheduleCalendarProps {
  scheduledContents: ScheduledContent[];
  currentParams: SearchParams;
}

export function ScheduleCalendar({ scheduledContents }: ScheduleCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState<Date | null>(null);

  // Mock AI scheduling suggestions
  const schedulingSuggestions = [
    { date: '2026-03-15', reason: 'Peak engagement time for tech audience', score: 92 },
    { date: '2026-03-18', reason: 'Industry event trending', score: 87 },
    { date: '2026-03-22', reason: 'Optimal weekday posting pattern', score: 84 }
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      POSTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      FAILED: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return statusColors[status] || 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: 'h-3 w-3' };
    switch (status) {
      case 'SCHEDULED':
        return <Clock {...iconProps} />;
      case 'POSTED':
        return <Check {...iconProps} />;
      case 'FAILED':
        return <X {...iconProps} />;
      default:
        return null;
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
    const isWeekendDay = isWeekend(date);

    // Return optimal posting times based on analytics
    if (isWeekendDay) {
      return ['10:00 AM', '2:00 PM', '6:00 PM'];
    } else {
      return ['9:00 AM', '12:00 PM', '5:00 PM'];
    }
  };

  const getEngagementPrediction = (date: Date) => {
    const contents = getContentsForDate(date);
    if (contents.length === 0) return null;

    // Mock prediction based on content and timing
    const baseScore = 75;
    const timeBonus = isWeekend(date) ? -5 : 10;
    const contentBonus = contents.length * 2;

    return Math.min(95, baseScore + timeBonus + contentBonus);
  };

  // Handle date/time selection and redirect to post creation
  const handleDateTimeSelect = (date: Date, time?: string) => {
    let selectedDateTime = date;

    if (time) {
      // Parse time and set it to the selected date
      const [hours, minutes] = time.split(':').map(Number);
      selectedDateTime = setMinutes(setHours(date, hours), minutes);
    } else {
      // Default to 9:00 AM if no time specified
      selectedDateTime = setMinutes(setHours(date, 9), 0);
    }

    // Ensure seconds are set to 0
    selectedDateTime = setSeconds(selectedDateTime, 0);

    // Format the date time for URL
    const dateStr = format(selectedDateTime, 'yyyy-MM-dd HH:mm');
    const encodedDateTime = encodeURIComponent(dateStr);

    // Redirect to post creation page with pre-filled date/time
    router.push(`/posts/create/${encodedDateTime}`);
  };

  // Handle clicking on a calendar day
  const handleDayClick = (date: Date) => {
    // Prevent selecting past dates
    if (isPastDate(date)) {
      return;
    }
    setSelectedDateForTime(date);
    setShowTimeModal(true);
  };

  // Handle time selection from modal
  const handleTimeSelection = (date: Date, time: string) => {
    handleDateTimeSelect(date, time);
  };

  // Initialize today's date
  const [today] = useState(() => new Date());

  // Check if a date is in the past (before today)
  const isPastDate = (date: Date) => {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    return dateStart < todayStart;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Helper to get total content count for the current view
  const totalContentCount = scheduledContents?.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white/40 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:border-slate-800/60 dark:bg-slate-950/40 dark:shadow-none"
    >

      <div className="flex flex-col md:flex-row md:items-center justify-between p-10 gap-8 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2rem] bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 group transition-all hover:rotate-6 hover:scale-110">
            <CalendarIcon className="h-10 w-10 transition-transform group-hover:scale-125" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter" suppressHydrationWarning>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex -space-x-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.2s]" />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {totalContentCount} DEPLOYMENT MILESTONES
              </p>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="cursor-pointer  flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Brain className="h-5 w-5" />
            AI Suggestions
          </Button>
        </div> */}

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-inner">
          <button
            onClick={handlePreviousMonth}
            className="rounded-xl p-3 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:scale-110 active:scale-90 transition-all dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <ChevronLeft className="h-6 w-6 stroke-[3px]" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-blue-600 transition-all hover:scale-110 active:scale-90"
          >
            CURRENT PHASE
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-xl p-3 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:scale-110 active:scale-90 transition-all dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <ChevronRight className="h-6 w-6 stroke-[3px]" />
          </button>
        </div>
      </div>

      {/* AI Scheduling Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Scheduling Recommendations</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Optimize your posting strategy with data-driven insights</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schedulingSuggestions?.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{suggestion.score}%</span>
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{format(new Date(suggestion.date), 'MMM d, yyyy')}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{suggestion.reason}</p>
                  <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all">
                    Schedule Here
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-7 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200/50 dark:bg-slate-800/50">
        <AnimatePresence mode="wait">
          {monthDays.map((day, index) => {
            const dayContents = getContentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.003 }}
                onClick={() => handleDayClick(day)}
                className={`group relative min-h-[180px] bg-white dark:bg-slate-900 p-5 cursor-pointer transition-all duration-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${!isCurrentMonth ? 'opacity-20 pointer-events-none grayscale' : ''
                  } ${isSelected ? 'z-10 ring-2 ring-inset ring-blue-600/50 bg-blue-50/30 dark:bg-blue-900/10' : ''
                  } ${isPastDate(day) ? 'cursor-not-allowed opacity-30 pointer-events-none' : ''}`}
              >
                {/* Visual Accent for Today */}
                {isToday && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                )}

                {/* Engagement Prediction Badge */}
                {getEngagementPrediction(day) && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {getEngagementPrediction(day)}%
                  </div>
                )}

                {/* Optimal Time Indicator */}
                {getContentsForDate(day).length > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-blue-500/20 backdrop-blur-sm text-blue-600 dark:text-blue-400 text-[8px] font-bold px-2 py-1 rounded-lg border border-blue-500/30">
                    <Lightbulb className="h-2.5 w-2.5" />
                    Best: {getBestPostingTimes(day)[0]}
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base font-black transition-all duration-500 ${isToday
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 scale-110 rotate-3'
                    : 'text-slate-900 dark:text-white group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1'
                    }`} suppressHydrationWarning>
                    {format(day, 'd')}
                  </span>
                  {dayContents.length > 0 && (
                    <div className="flex gap-1">
                      <span className="block h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                      <span className="block h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {dayContents.slice(0, 2).map((content, idx) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(content);
                      }}
                      className={`group/item relative overflow-hidden text-[10px] font-black p-3 rounded-2xl transition-all border border-transparent hover:border-blue-500/20 hover:shadow-xl shadow-sm ${getStatusColor(content.status)}`}
                    >
                      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-2.5 relative z-10">
                        <div className="opacity-80 transition-transform group-hover/item:scale-125 group-hover/item:rotate-12">
                          {getStatusIcon(content.status)}
                        </div>
                        <span className="truncate uppercase tracking-tight">
                          {content.title || 'Untitled Draft'}
                        </span>
                      </div>
                      {/* Performance indicator - temporarily removed due to missing analytics data */}
                      {/* {content.analytics && (
                        <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[8px] font-bold">
                          <Zap className="h-2 w-2" />
                          {Math.round(content.analytics.engagementRate * 100)}%
                        </div>
                      )} */}
                    </motion.div>
                  ))}
                  {dayContents.length > 2 && (
                    <button className="flex items-center gap-2 px-4 text-[10px] font-black text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl py-2 w-full border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-[0.15em] transition-all hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 hover:translate-y-[-2px] hover:shadow-lg">
                      <MoreHorizontal className="h-3 w-3" />
                      {dayContents.length - 2} MORE
                    </button>
                  )}

                  {/* Create Post Button - Show when no content or on hover */}
                  {dayContents.length === 0 && !isPastDate(day) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateForTime(day);
                        setShowTimeModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800 uppercase tracking-[0.15em] transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:translate-y-[-2px] hover:shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="h-3 w-3" />
                      CREATE POST
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
          onTimeSelect={handleTimeSelection}
        />
      )}


    </motion.div>
  );
}


