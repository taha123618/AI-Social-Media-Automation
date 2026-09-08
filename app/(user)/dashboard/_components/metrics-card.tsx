'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  index?: number;
}

export function MetricsCard({
  icon,
  label,
  value,
  change,
  changeType = 'positive',
  index = 0,
}: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
    >
      <div className="flex items-start justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary/10">
            {icon}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold ${
            changeType === 'positive'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : changeType === 'negative'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <span>{change}</span>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground" suppressHydrationWarning>
          {value}
        </h3>
      </div>
    </motion.div>
  );
}
