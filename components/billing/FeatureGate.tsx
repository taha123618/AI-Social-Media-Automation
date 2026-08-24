'use client';

import React from 'react';
import { FeatureKey, PlanId, PLANS } from '@/features/billing/config/plans.config';
import Link from 'next/link';

interface FeatureGateProps {
  feature: FeatureKey;
  userPlan?: PlanId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  userPlan = 'free',
  children,
  fallback,
}: FeatureGateProps) {
  const plan = PLANS[userPlan] || PLANS.free;
  const featureVal = plan.features[feature];

  const hasAccess =
    typeof featureVal === 'boolean'
      ? featureVal
      : typeof featureVal === 'number'
      ? featureVal === -1 || featureVal > 0
      : featureVal !== 'none';

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredPlanId: PlanId = PLANS.starter.features[feature] ? 'starter' : 'pro';
  const requiredPlanName = PLANS[requiredPlanId]?.name || 'Starter';

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Unlock {feature.replace(/_/g, ' ').toUpperCase()}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        This feature requires the <span className="font-semibold text-amber-500">{requiredPlanName} Plan</span> or higher.
      </p>
      <div className="mt-4">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
        >
          Upgrade to {requiredPlanName}
        </Link>
      </div>
    </div>
  );
}
