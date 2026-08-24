'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ContentCardProps {
  title: string;
  status: string;
  date: string;
  platforms: string[];
  author?: string;
  index?: number;
}

export function ContentCard({
  title,
  status,
  date,
  platforms,
  author,
  index = 0,
}: ContentCardProps) {
  const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
    pending_approval: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    pending_review: {
      label: 'Review',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    generated: {
      label: 'Generated',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500',
    },
    draft: {
      label: 'Draft',
      className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      dot: 'bg-slate-500',
    },
    approved: {
      label: 'Approved',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500',
    },
    published: {
      label: 'Published',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-500',
    },
    posted: {
      label: 'Published',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-500',
    },
    failed: {
      label: 'Failed',
      className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
    },
  };

  const config = statusConfig[status] || statusConfig.pending_approval;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/contents/${title.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
        <div className="relative flex cursor-pointer items-center justify-between rounded-3xl border border-slate-200/60 bg-white/40 backdrop-blur-md p-6 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${config.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
                {config.label}
              </div>
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {date}
              </span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 tracking-tight">
              {title}
            </h4>
            <div className="mt-4 flex items-center gap-5">
              {author && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-[11px] font-black text-slate-600 dark:text-slate-300 border border-white dark:border-slate-600 shadow-sm">
                    {author.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{author}</span>
                </div>
              )}
              <div className="flex gap-2">
                {platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 uppercase tracking-widest"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="shrink-0 h-12 w-12 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-[360deg] shadow-inner">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  index?: number;
}

export function QuickAction({ icon, label, onClick, index = 0 }: QuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="group relative flex w-full items-center gap-5 rounded-3xl border border-slate-200/60 bg-white/40 backdrop-blur-md p-5 text-left transition-all hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-blue-600 blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-500 group-hover:bg-linear-to-br group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white group-hover:rotate-12">
          {icon}
        </div>
      </div>
      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {label}
      </span>
      <div className="ml-auto opacity-0 translate-x-[-10px] transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}
