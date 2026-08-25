'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSubscriptionDetails } from '@/features/billing/types';
import { PLANS } from '@/features/billing/config/plans.config';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import Link from 'next/link';

export default function BillingSettingsPage() {
  const { businessId, isLoading: isBusinessLoading } = useCurrentBusiness();
  const [details, setDetails] = useState<BusinessSubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      if (!businessId) {
        if (!isBusinessLoading) setLoading(false);
        return;
      }

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
  }, [businessId, isBusinessLoading]);

  const handleUpgrade = async (planId: 'starter' | 'pro') => {
    if (!businessId) return;
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
        const checkoutUrl = data.checkoutUrl || data.url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePortal = async () => {
    if (!businessId) return;
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

  if (loading || isBusinessLoading) {
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

        {details && (
          <div className="mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Current billing period ends on{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {new Date(details.currentPeriodEnd).toLocaleDateString()}
            </span>
            {details.cancelAtPeriodEnd && (
              <span className="ml-2 text-amber-600 font-semibold">
                (Cancels at period end)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quotas & Metered Usage */}
      {details && details.usage.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Monthly Quota & Usage Limits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.usage.map((u) => (
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
      )}

      {/* Plan Tiers Switcher */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Available Plans
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Scale your social media and blog generation workflows as your team grows.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-neutral-900 shadow text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-neutral-900 shadow text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              Annual (Save ~20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['free', 'starter', 'pro'] as const).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = currentPlan.id === planId;
            const priceInDollars =
              billingCycle === 'annual'
                ? Math.round(plan.pricing.annual / 100)
                : Math.round(plan.pricing.monthly / 100);

            return (
              <div
                key={planId}
                className={`rounded-xl border p-6 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
                      ${priceInDollars}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      /{billingCycle === 'annual' ? 'mo billed annually' : 'month'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {plan.description}
                  </p>

                  <ul className="mt-6 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {plan.features.ai_posts === -1
                        ? 'Unlimited'
                        : plan.features.ai_posts}{' '}
                      AI social posts / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {plan.features.ai_articles === -1
                        ? 'Unlimited'
                        : plan.features.ai_articles}{' '}
                      AI blog articles / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {plan.features.article_word_limit === -1
                        ? 'No word count limits'
                        : `${plan.features.article_word_limit.toLocaleString()} max words / article`}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {plan.features.brand_voice_profiles === -1
                        ? 'Unlimited'
                        : plan.features.brand_voice_profiles}{' '}
                      Brand Voice profiles
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 py-2 text-xs font-semibold text-neutral-500 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : planId === 'free' ? (
                    <button
                      disabled
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 py-2 text-xs font-semibold text-neutral-500"
                    >
                      Default Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(planId as 'starter' | 'pro')}
                      disabled={actionLoading}
                      className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50"
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
