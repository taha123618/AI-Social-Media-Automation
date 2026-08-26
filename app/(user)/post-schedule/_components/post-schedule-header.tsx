'use client';

import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PostScheduleHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Cron Scheduling Engine
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          Posting Schedule
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            Automated Queues
          </Badge>
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure recurring distribution windows and inspect queued payloads dispatched via BullMQ workers.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-xs font-mono text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Cron active</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-xs font-mono text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>BullMQ synced</span>
        </div>
      </div>
    </div>
  );
}
