import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PostMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

export const PostMetricCard = ({ label, value, icon: Icon, delay = 0 }: PostMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs relative overflow-hidden text-left"
    >
      <div className="flex items-center justify-between mb-2.5 relative z-10">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="relative z-10">
        <div className="text-2xl font-bold font-mono text-foreground tracking-tight" suppressHydrationWarning>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </motion.div>
  );
};
