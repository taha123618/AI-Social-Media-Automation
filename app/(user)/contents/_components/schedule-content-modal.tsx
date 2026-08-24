'use client';

import { X, Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ContentDraft } from '../types';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { updateSchedule } from '../actions/mutations';
import { toast } from 'sonner';

interface ScheduleContentModalProps {
  content: ContentDraft;
  onClose: () => void;
}

export function ScheduleContentModal({ content, onClose }: ScheduleContentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [dates, setDates] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the selected date is today
  const isToday = () => {
    const today = startOfToday();
    return isSameDay(selectedDate, today);
  };

  // Get minimum time for today (current time + 30 minutes buffer)
  const getMinTime = () => {
    if (!isToday()) return '00:00';

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = (Math.floor(now.getMinutes() / 5) * 5 + 30).toString().padStart(2, '0');

    // Handle minute overflow
    if (parseInt(minutes) >= 60) {
      const nextHour = (now.getHours() + 1).toString().padStart(2, '0');
      return `${nextHour}:00`;
    }

    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    // Ensure dates are only calculated on client to avoid hydration mismatch
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
    } catch (error) {
      toast.error('Failed to schedule content');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Schedule Post</h2>
        <p className="mt-1 text-sm text-slate-500">Pick a time to publish "{content.title}"</p>

        <div className="mt-8 space-y-8">
          {/* Date Picker (Horizontal) */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {dates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center min-w-17.5 rounded-2xl p-4 transition-all border-2 ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700'
                      }`}
                  >
                    <span className="text-[10px] font-bold uppercase mb-1 opacity-70" suppressHydrationWarning>{format(date, 'EEE')}</span>
                    <span className="text-lg font-bold" suppressHydrationWarning>{format(date, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Select Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                min={getMinTime()}
                className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 focus:border-blue-600 focus:outline-none transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={isSaving}
            className="flex-1 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
