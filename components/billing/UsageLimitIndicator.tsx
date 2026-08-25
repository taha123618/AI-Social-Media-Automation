'use client';

import React from 'react';
import Link from 'next/link';
import { FeatureKey } from '@/features/billing/config/plans.config';
import { ArrowUpRight } from 'lucide-react';

interface UsageLimitIndicatorProps {
  feature: FeatureKey;
  label: string;
  used: number;
  limit: number; // -1 for unlimited
  showWarningThreshold?: number; // default 80%
}

export function UsageLimitIndicator({
  label,
  used,
  limit,
  showWarningThreshold = 80,
}: UsageLimitIndicatorProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = !isUnlimited && percentage >= showWarningThreshold;
  const isExhausted = !isUnlimited && used >= limit;

  return (
    <div className="rounded-none border border-border bg-card p-3.5 shadow-none">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase font-bold text-foreground tracking-wider">{label}</span>
        <span className="font-mono text-xs font-bold">
          {isUnlimited ? (
            <span className="text-primary uppercase">UNLIMITED</span>
          ) : (
            <span className="text-muted-foreground">
              <strong className="text-foreground">{used}</strong> / {limit} <span className="text-[10px] text-muted-foreground">({percentage}%)</span>
            </span>
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-none bg-secondary border border-border">
          <div
            className={`h-full transition-none ${
              isExhausted
                ? 'bg-destructive'
                : isNearLimit
                ? 'bg-amber-400'
                : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isExhausted && (
        <div className="mt-2 flex items-center justify-between pt-1 border-t border-border">
          <p className="text-[11px] font-mono text-destructive font-bold uppercase tracking-wider">
            QUOTA EXHAUSTED
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-primary hover:underline"
          >
            UPGRADE TIER <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
