'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface QuickActionProps {
   icon: ReactNode;
   label: string;
   onClick?: () => void;
   index?: number;
}

export function QuickAction({ icon, label, onClick, index = 0 }: QuickActionProps) {
   return (
      <motion.button
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.3, delay: index * 0.05 }}
         whileHover={{ x: 4 }}
         onClick={onClick}
         className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-500/50 hover:bg-blue-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20"
      >
         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-300">
            {icon}
         </div>
         <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label}
         </span>
         <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
            </svg>
         </span>
      </motion.button>
   );
}
