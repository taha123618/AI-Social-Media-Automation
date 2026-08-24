'use client';

import { useState, useEffect } from 'react';
import { Plus, Zap, Clock, TrendingUp, X, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { BestTimesPanel } from './best-times-panel';

export function ScheduleHeader() {
  const { businessId } = useCurrentBusiness();
  const [showBestTimes, setShowBestTimes] = useState(false);
  const [autopilot, setAutopilot] = useState<{ enabled: boolean; daysLeft?: number; endsAt?: string } | null>(null);
  const [isTogglingAutopilot, setIsTogglingAutopilot] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/social/scheduling/autopilot?businessId=${businessId}`, {
      headers: { 'x-business-id': businessId }
    })
      .then(r => r.json())
      .then(data => { if (data.success) setAutopilot(data.autopilot); })
      .catch(() => { });
  }, [businessId]);

  const handleToggleAutopilot = async () => {
    if (!businessId) return;
    setIsTogglingAutopilot(true);
    try {
      const action = autopilot?.enabled ? 'disable' : 'enable';
      const res = await fetch('/api/social/scheduling/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ action, days: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        setAutopilot(action === 'enable'
          ? { enabled: true, daysLeft: 30, endsAt: data.endsAt }
          : { enabled: false });
        toast.success(data.message);
      }
    } catch {
      toast.error('Failed to toggle autopilot');
    } finally {
      setIsTogglingAutopilot(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-10"
      >
        <div className="relative">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-linear-to-b from-blue-600 to-cyan-600 rounded-full hidden md:block" />
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-1">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse [animation-delay:0.2s]" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
              Content Planner
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
            Omni <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">Schedule</span>
          </h1>
          <p className="mt-4 text-lg font-bold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Master your multi-channel deployment with <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">strategic timing</span> and visual orchestration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Best Times button */}
          <Button
            variant="outline"
            onClick={() => setShowBestTimes(true)}
            className="group h-12 gap-2 rounded-2xl border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all px-5"
          >
            <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Best Times
          </Button>

          {/* Autopilot toggle */}
          <Button
            onClick={handleToggleAutopilot}
            disabled={isTogglingAutopilot}
            className={`h-12 gap-2 rounded-2xl font-bold px-5 transition-all ${autopilot?.enabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
              }`}
          >
            {isTogglingAutopilot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : autopilot?.enabled ? (
              <Check className="h-4 w-4" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {autopilot?.enabled ? (
              <span className="flex items-center gap-1.5">
                Autopilot ON
                {autopilot.daysLeft && (
                  <span className="bg-white/20 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {autopilot.daysLeft}d left
                  </span>
                )}
              </span>
            ) : '30-Day Autopilot'}
          </Button>

          <Link
            href="/posts/create"
            className="group relative flex h-12 items-center gap-3 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 px-8 text-xs font-black text-white shadow-2xl shadow-blue-500/25 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden uppercase tracking-widest"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 stroke-[3px]" />
            CREATE POST
          </Link>
        </div>
      </motion.div>

      <BestTimesPanel isOpen={showBestTimes} onClose={() => setShowBestTimes(false)} />
    </>
  );
}
