'use client';
import { motion } from 'framer-motion';

export function SettingsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-16"
    >
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-slate-500/5 blur-[100px] pointer-events-none" />
      <div className="relative">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-linear-to-b from-slate-600 to-slate-400 rounded-full hidden md:block" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-1">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-pulse" />
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Control Center
          </p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
          System <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-600 via-blue-600 to-indigo-600 dark:from-slate-400 dark:via-blue-400 dark:to-indigo-400">Configuration</span>
        </h1>
        <p className="mt-4 text-lg font-bold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Orchestrate your workspace, security, and integration parameters with <span className="text-slate-900 dark:text-white underline decoration-slate-500/30 underline-offset-4">enterprise-grade precision</span>.
        </p>
      </div>
    </motion.div>
  );
}
