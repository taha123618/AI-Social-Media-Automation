'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
  const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'lime' | 'amber' | 'cyan'> = {
    pending_approval: 'amber',
    pending_review: 'amber',
    generated: 'cyan',
    draft: 'secondary',
    approved: 'lime',
    scheduled: 'cyan',
    published: 'default',
    posted: 'default',
    failed: 'destructive',
    rejected: 'destructive',
  };

  const variant = statusVariantMap[status] || 'secondary';

  return (
    <Link href={`/contents/${title.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
      <div className="relative flex cursor-pointer items-center justify-between rounded-none border border-border bg-card p-3.5 transition-none hover:border-primary/60 hover:bg-secondary/40 shadow-none">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={variant}>
              {status.replace(/_/g, ' ')}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {date}
            </span>
          </div>
          <h4 className="text-xs font-mono font-bold text-foreground truncate tracking-tight uppercase group-hover:text-primary transition-none">
            {title}
          </h4>
          <div className="mt-2.5 flex items-center gap-3">
            {author && (
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                <span className="text-primary font-bold">OP:</span>
                <span className="text-foreground">{author}</span>
              </div>
            )}
            <div className="flex gap-1">
              {platforms?.map((platform) => (
                <span
                  key={platform}
                  className="px-1.5 py-0.5 rounded-none bg-secondary text-[9px] font-mono font-bold text-muted-foreground border border-border uppercase"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 h-7 w-7 rounded-none border border-border bg-secondary flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-none">
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
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
    <button
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 rounded-none border border-border bg-card p-3 text-left transition-none hover:border-primary/60 hover:bg-secondary/40 shadow-none"
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-secondary border border-border text-foreground group-hover:border-primary group-hover:text-primary transition-none">
        {icon}
      </div>
      <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider group-hover:text-primary transition-none">
        {label}
      </span>
      <div className="ml-auto text-muted-foreground group-hover:text-primary transition-none">
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}
