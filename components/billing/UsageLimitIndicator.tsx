'use client';

import React from 'react';
import Link from 'next/link';
import { FeatureKey } from '@/features/billing/config/plans.config';
import { ArrowUpRight } from 'lucide-react';

interface UsageLimitIndicatorProps {
  feature: FeatureKey;
  label: string;
  used: number;
  limit: number;
  showWarningThreshold?: number;
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
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono font-medium">
          {isUnlimited ? (
            <span className="text-primary font-semibold">Unlimited</span>
          ) : (
            `${used} / ${limit}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isExhausted
                ? 'bg-destructive'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isExhausted && (
        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-[11px] text-destructive font-medium">
            Quota exhausted
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
          >
            <span>Upgrade</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
