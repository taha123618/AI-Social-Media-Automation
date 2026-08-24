'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock, XCircle, Play } from 'lucide-react';

interface AutomationCardProps {
  workflowName: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  index?: number;
}

export function AutomationCard({
  workflowName,
  status,
  startedAt,
  completedAt,
  index = 0,
}: AutomationCardProps) {
  const statusConfig: Record<string, { label: string; className: string; icon: any; color: string }> = {
    COMPLETED: {
      label: 'Success',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    RUNNING: {
      label: 'Running',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Activity,
      color: 'text-blue-500',
    },
    FAILED: {
      label: 'Failed',
      className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      icon: XCircle,
      color: 'text-rose-500',
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Clock,
      color: 'text-amber-500',
    },
    CANCELLED: {
      label: 'Cancelled',
      className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      icon: XCircle,
      color: 'text-slate-500',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const timeDisplay = startedAt
    ? new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-md p-4 transition-all duration-300 hover:bg-white hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/40"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}>
        <StatusIcon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {workflowName}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">•</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            {timeDisplay}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <Play className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
      </div>
    </motion.div>
  );
}
