'use client';

import { useState } from 'react';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, addWeeks, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

interface RecommendBestTimeButtonProps {
  businessId: string | null | undefined;
  onSelectTime: (date: Date) => void;
  disabled?: boolean;
}

const DAY_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function RecommendBestTimeButton({ businessId, onSelectTime, disabled }: RecommendBestTimeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRecommend = async () => {
    if (!businessId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/social/scheduling/best-times?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      const data = await res.json();
      if (!data.success || !data.recommendations?.length) {
        toast.error('No recommendations available yet — post more content first');
        return;
      }

      const top = data.recommendations[0];
      const today = new Date();
      const todayDay = today.getDay();

      // Find the next occurrence of the recommended day
      let daysUntil = top.day - todayDay;
      if (daysUntil <= 0) daysUntil += 7;

      const nextDate = addDays(today, daysUntil);
      const nextDateWithTime = setMilliseconds(
        setSeconds(setMinutes(setHours(nextDate, top.hour), 0), 0),
        0
      );

      onSelectTime(nextDateWithTime);
      toast.success(`Recommended: ${top.dayName} at ${top.label} (score: ${top.score}%)`);
    } catch {
      toast.error('Could not load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRecommend}
      disabled={disabled || isLoading}
      className={`flex items-center h-11 rounded-xl px-4 font-bold border border-violet-200 dark:border-violet-800 transition-all gap-2 ${
        disabled || isLoading
          ? 'opacity-50 cursor-not-allowed'
          : 'bg-violet-50/50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20'
      }`}
      title="Recommend best time to post based on past performance"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span className="text-sm hidden md:inline">Best Time</span>
    </button>
  );
}
