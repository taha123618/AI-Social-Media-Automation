'use client';

import React from 'react';
import { FeatureKey } from '@/features/billing/config/plans.config';

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
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-500 dark:text-neutral-400 font-mono">
          {isUnlimited ? (
            <span className="text-emerald-500 font-semibold">Unlimited</span>
          ) : (
            `${used} / ${limit}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={`h-full transition-all duration-300 ${
              isExhausted
                ? 'bg-rose-500'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isExhausted && (
        <p className="mt-1 text-xs text-rose-500 font-medium">
          Quota exhausted. Upgrade plan to generate more.
        </p>
      )}
    </div>
  );
}
