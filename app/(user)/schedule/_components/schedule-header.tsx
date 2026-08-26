'use client';

import { useState, useEffect } from 'react';
import { Plus, Zap, Clock, TrendingUp, Check, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Omni Content Scheduler
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Omni Schedule
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              AI Timetable
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Orchestrate multi-platform posting windows, AI heatmaps, and continuous autopilot queues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBestTimes(true)}
            className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>AI Peak Times</span>
          </Button>

          <Button
            size="sm"
            onClick={handleToggleAutopilot}
            disabled={isTogglingAutopilot}
            variant={autopilot?.enabled ? "default" : "outline"}
            className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5"
          >
            {isTogglingAutopilot ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : autopilot?.enabled ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{autopilot?.enabled ? `Autopilot ON (${autopilot.daysLeft || 30}d)` : '30-Day Autopilot'}</span>
          </Button>

          <Link href="/posts/create">
            <Button
              size="sm"
              className="h-9 rounded-xl px-4 text-xs font-semibold shadow-xs gap-1.5 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Post</span>
            </Button>
          </Link>
        </div>
      </div>

      <BestTimesPanel isOpen={showBestTimes} onClose={() => setShowBestTimes(false)} />
    </>
  );
}
