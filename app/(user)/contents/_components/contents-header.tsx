'use client';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AutopilotButton } from './autopilot-button';

export function ContentsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-10"
    >
      <div className="relative">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-linear-to-b from-blue-600 to-purple-600 rounded-full hidden md:block" />
        <div className="flex -space-x-1 mb-3">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse [animation-delay:0.2s]" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          Resource Library
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
          Content <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">Library</span>
        </h1>
        <p className="mt-4 text-lg font-bold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Manage and organize all your brand-aligned <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">content drafts</span> in one high-performance hub.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:items-end">
        <AutopilotButton
          onComplete={(draftsCreated) => {
            console.log(`Created ${draftsCreated} drafts`);
            window.dispatchEvent(new CustomEvent('drafts-updated'));
          }}
        />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-create-content'))}
          className="group relative flex items-center justify-center gap-3 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 px-10 py-5 text-white font-black shadow-2xl shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 stroke-[3px]" />
          <span className="tracking-widest">CREATE DRAFT</span>
        </button>
      </div>
    </motion.div>
  );
}
