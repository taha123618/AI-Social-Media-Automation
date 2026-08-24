'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronDown, 
  MapPin, Globe, Sparkles, Check
} from 'lucide-react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';

interface SchedulingPopoverProps {
  scheduledDateTime: Date | null;
  onDateTimeChange: (date: Date | null) => void;
  children?: React.ReactNode;
}

const BEST_TIMES = [
  { time: '09:00 AM', label: 'Morning Peak' },
  { time: '12:30 PM', label: 'Lunch Break' },
  { time: '06:00 PM', label: 'Evening Peak' },
  { time: '09:00 PM', label: 'Late Night' },
];

export function SchedulingPopover({
  scheduledDateTime,
  onDateTimeChange,
  children
}: SchedulingPopoverProps) {
  const [date, setDate] = useState<Date | undefined>(scheduledDateTime || undefined);
  const [time, setTime] = useState(scheduledDateTime ? format(scheduledDateTime, 'hh:mm a') : '09:00 AM');

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      updateDateTime(selectedDate, time);
    }
  };

  const updateDateTime = (d: Date, t: string) => {
    const [timeStr, period] = t.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'PM' && hours < 12) adjustedHours += 12;
    if (period === 'AM' && hours === 12) adjustedHours = 0;

    const newDate = new Date(d);
    newDate.setHours(adjustedHours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    
    onDateTimeChange(newDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      updateDateTime(date, newTime);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" className="h-11 rounded-xl px-6 font-bold gap-2 border-slate-200 dark:border-slate-800">
            <CalendarIcon className="h-4 w-4" />
            {scheduledDateTime ? format(scheduledDateTime, 'MMM dd, hh:mm a') : 'Pick Time'}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden" align="start">
        <div className="flex flex-col md:flex-row">
          <div className="p-4 border-r border-slate-50 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" />
                Select Date
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              className="rounded-xl border-none p-0"
            />
          </div>

          <div className="w-full md:w-64 p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-6">
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Select Time
              </div>
              <Select value={time} onValueChange={handleTimeChange}>
                <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-64 rounded-xl border-slate-100 dark:border-slate-800">
                  {Array.from({ length: 24 * 4 }).map((_, i) => {
                    const h = Math.floor(i / 4);
                    const m = (i % 4) * 15;
                    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    const period = h >= 12 ? 'PM' : 'AM';
                    const timeStr = `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
                    return (
                      <SelectItem key={timeStr} value={timeStr} className="rounded-lg">
                        {timeStr}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Sparkles className="h-3 w-3 text-purple-500" />
                 Suggested Times
               </div>
               <div className="grid grid-cols-1 gap-2">
                 {BEST_TIMES.map((item) => (
                   <button
                     key={item.time}
                     onClick={() => handleTimeChange(item.time)}
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold ${
                       time === item.time
                         ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                         : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-blue-200'
                     }`}
                   >
                     <span>{item.time}</span>
                     <span className="opacity-50 text-[10px]">{item.label}</span>
                     {time === item.time && <Check className="h-3 w-3" />}
                   </button>
                 ))}
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-tight">
                    <Globe className="h-3 w-3" />
                    Greenwich Mean Time (GMT+0)
                </div>
                <Button 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    onClick={() => {}}
                >
                    Confirm Schedule
                </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
