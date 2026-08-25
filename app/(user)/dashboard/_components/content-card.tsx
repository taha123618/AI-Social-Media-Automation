'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

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
      className: 'bg-primary/10 text-primary border-primary/20',
      dot: 'bg-primary',
    },
    draft: {
      label: 'Draft',
      className: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground',
    },
    approved: {
      label: 'Approved',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-accent/10 text-accent border-accent/20',
      dot: 'bg-accent',
    },
    published: {
      label: 'Published',
      className: 'bg-primary/10 text-primary border-primary/20',
      dot: 'bg-primary',
    },
    posted: {
      label: 'Published',
      className: 'bg-primary/10 text-primary border-primary/20',
      dot: 'bg-primary',
    },
    failed: {
      label: 'Failed',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      dot: 'bg-destructive',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      dot: 'bg-destructive',
    },
  };

  const config = statusConfig[status] || statusConfig.pending_approval;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link href={`/contents/${title.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
        <div className="relative flex cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {date}
              </span>
            </div>

            <h4 className="text-sm font-bold text-foreground truncate transition-colors group-hover:text-primary">
              {title}
            </h4>

            <div className="mt-2.5 flex items-center gap-4">
              {author && (
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground font-mono">
                    {author.charAt(0)}
                  </div>
                  <span className="text-xs text-muted-foreground">{author}</span>
                </div>
              )}
              <div className="flex gap-1.5">
                {platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-mono font-medium text-foreground uppercase tracking-wider"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            <ChevronRight className="h-4 w-4" />
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative flex w-full items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/40"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <span className="text-xs font-bold text-foreground transition-colors group-hover:text-primary">
        {label}
      </span>
      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
