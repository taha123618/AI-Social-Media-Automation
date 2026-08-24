'use client';

import React from 'react';
import { FeatureKey, PLANS, PlanId } from '@/features/billing/config/plans.config';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: FeatureKey;
  onClose?: () => void;
}

export function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
  const requiredPlanId: PlanId = PLANS.starter.features[feature] ? 'starter' : 'pro';
  const requiredPlan = PLANS[requiredPlanId] || PLANS.starter;

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-8 text-center backdrop-blur-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Upgrade to {requiredPlan.name}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        Unlock <span className="font-semibold text-neutral-900 dark:text-neutral-200">{feature.replace(/_/g, ' ').toUpperCase()}</span> and accelerate your social media workflows.
      </p>

      <ul className="mx-auto my-6 max-w-sm space-y-2 text-left text-sm text-neutral-600 dark:text-neutral-400">
        {requiredPlan.highlights.slice(0, 4).map((h, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Maybe Later
          </button>
        )}
        <Link
          href="/pricing"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
        >
          View Pricing & Plans
        </Link>
      </div>
    </div>
  );
}
