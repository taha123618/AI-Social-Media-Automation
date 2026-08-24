'use client';
import { ReactNode, useId } from 'react';
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
   const gridId = useId();
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
         whileHover={{ y: -6, scale: 1.02 }}
         className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-8 transition-all hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)]"
      >
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 0H100V100H0V0Z" fill={`url(#${gridId})`} />
               <defs>
                  <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
                     <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
               </defs>
            </svg>
         </div>

         {/* Dynamic Glow Effect */}
         <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[60px] transition-all duration-500 group-hover:bg-blue-500/20 group-hover:scale-150" />

         <div className="flex items-start justify-between relative z-10">
            <div>
               <p className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
               <h3 className="mt-3 text-4xl font-black tracking-tighter text-slate-900 dark:text-white" suppressHydrationWarning>
                  {value}
               </h3>
               <div className="mt-4 flex items-center gap-2">
                  <div
                     className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black transition-colors ${changeType === 'positive'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : changeType === 'negative'
                           ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                           : 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                        }`}
                  >
                     {changeType === 'positive' && <span>↑</span>}
                     {changeType === 'negative' && <span>↓</span>}
                     {change}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">vs last week</span>
               </div>
            </div>

            <div className="relative">
               <div className="absolute inset-0 bg-blue-600 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
               <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 p-3.5 text-white shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                  {icon}
               </div>
            </div>
         </div>

         {/* Bottom Accent Line */}
         <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-700 group-hover:w-full" />
      </motion.div>
   );
}
