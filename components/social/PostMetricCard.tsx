import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PostMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

/**
 * Premium Metric Card with glassmorphism and subtle animations
 */
export const PostMetricCard = ({ label, value, icon: Icon, color, delay = 0 }: PostMetricCardProps) => {
  const colorMap = {
    pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 blur-3xl opacity-20 bg-${color === 'pink' ? 'pink' : color === 'blue' ? 'blue' : color === 'green' ? 'emerald' : color}-500 transition-opacity group-hover:opacity-40`} />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`p-2 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500/80">{label}</span>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </motion.div>
  );
};
