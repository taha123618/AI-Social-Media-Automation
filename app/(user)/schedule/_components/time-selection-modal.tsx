'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onTimeSelect: (date: Date, time: string) => void;
}

export function TimeSelectionModal({ isOpen, onClose, selectedDate, onTimeSelect }: TimeSelectionModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  // Check if the selected date is today
  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  // Get minimum time for today (current time + 30 minutes buffer)
  const getMinTime = () => {
    if (!isToday()) return '00:00';

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = (Math.floor(now.getMinutes() / 5) * 5 + 30).toString().padStart(2, '0');

    // Handle minute overflow (e.g., if it's 10:55, next slot should be 11:25)
    if (parseInt(minutes) >= 60) {
      const nextHour = (now.getHours() + 1).toString().padStart(2, '0');
      return `${nextHour}:00`;
    }

    return `${hours}:${minutes}`;
  };

  const optimalTimes = [
    { time: '09:00', label: '9:00 AM', description: 'Morning engagement peak' },
    { time: '12:00', label: '12:00 PM', description: 'Lunch break browsing' },
    { time: '17:00', label: '5:00 PM', description: 'After work wind-down' },
    { time: '19:00', label: '7:00 PM', description: 'Evening prime time' },
    { time: '21:00', label: '9:00 PM', description: 'Late night scrolling' }
  ];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    onTimeSelect(selectedDate, selectedTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Select Time
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Optimal Posting Times
            </label>
            <div className="grid grid-cols-1 gap-2">
              {optimalTimes.map((timeOption) => (
                <button
                  key={timeOption.time}
                  onClick={() => handleTimeSelect(timeOption.time)}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${selectedTime === timeOption.time
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {timeOption.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {timeOption.description}
                      </div>
                    </div>
                    {selectedTime === timeOption.time && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Custom Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min={getMinTime()}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isToday() && selectedTime < getMinTime()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Post
          </button>
        </div>
      </motion.div>
    </div>
  );
}
