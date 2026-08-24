'use client';
import { Brain, Plus, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

export function WorkflowHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-10"
    >
      <div className="relative">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-linear-to-b from-indigo-600 to-blue-600 rounded-full hidden md:block" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-1">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            System Automation
          </p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
          Workflow <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400">Engine</span>
        </h1>
        <p className="mt-4 text-lg font-bold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Command your social presence with autonomous <span className="text-slate-900 dark:text-white underline decoration-indigo-500/30 underline-offset-4">intelligent workflows</span> and content pipelines.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button className="group relative flex h-14 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/50 backdrop-blur-md px-8 text-xs font-black text-slate-700 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-indigo-400 uppercase tracking-widest overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-125 group-hover:rotate-12 stroke-[2.5px]" />
          RUN ALL ACTIVE
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-create-workflow'))}
          className="group relative flex h-14 items-center gap-3 rounded-2xl bg-linear-to-br from-indigo-600 to-blue-700 px-10 text-xs font-black text-white shadow-2xl shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden uppercase tracking-widest"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 stroke-[3px]" />
          NEW WORKFLOW
        </button>
      </div>
    </motion.div>
  );
}
