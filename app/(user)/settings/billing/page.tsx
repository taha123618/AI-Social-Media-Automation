'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSubscriptionDetails } from '@/features/billing/types';
import { PLANS } from '@/features/billing/config/plans.config';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';
import Link from 'next/link';

export default function BillingSettingsPage() {
  const [details, setDetails] = useState<BusinessSubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [actionLoading, setActionLoading] = useState(false);

  // In a multi-tenant app, businessId is resolved from context/session
  const businessId = 'default_business_id';

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch(`/api/billing/subscription?businessId=${businessId}`);
        if (res.ok) {
          const json = await res.json();
          setDetails(json.data);
        }
      } catch (err) {
        console.error('Failed to load subscription details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, [businessId]);

  const handleUpgrade = async (planId: 'starter' | 'pro') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          planId,
          billingCycle,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePortal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          returnUrl: window.location.href,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.portalUrl) {
          window.location.href = data.portalUrl;
        }
      }
    } catch (err) {
      console.error('Portal redirect failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const currentPlan = details?.plan || PLANS.free;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Billing & Subscriptions
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage your subscription plan, track monthly usage quotas, and view invoices.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {currentPlan.name} Plan
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 uppercase">
                {details?.status || 'Active'}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {currentPlan.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {details?.billingPortalUrl ? (
              <button
                onClick={handleManagePortal}
                disabled={actionLoading}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                Manage Billing & Invoices
              </button>
            ) : (
              <Link
                href="/pricing"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Monthly Feature Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {details?.usage.map((u) => (
            <UsageLimitIndicator
              key={u.feature}
              feature={u.feature}
              label={u.feature.replace(/_/g, ' ').toUpperCase()}
              used={u.used}
              limit={u.limit}
            />
          ))}
        </div>
      </div>

      {/* Available Plans Upgrade Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Available Plans
          </h3>
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['free', 'starter', 'pro'] as const).map((pid) => {
            const plan = PLANS[pid];
            const isCurrent = currentPlan.id === pid;
            const price = billingCycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;

            return (
              <div
                key={pid}
                className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/10'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <span className="rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                      ${price > 0 ? (price / 100).toFixed(0) : '0'}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {plan.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 py-2 text-sm font-medium text-neutral-400 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : pid === 'free' ? (
                    <button
                      disabled
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 py-2 text-sm font-medium text-neutral-500"
                    >
                      Included
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(pid as 'starter' | 'pro')}
                      disabled={actionLoading}
                      className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
