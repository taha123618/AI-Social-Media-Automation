'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSubscriptionDetails } from '@/features/billing/types';
import { PLANS } from '@/features/billing/config/plans.config';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <div className="h-6 w-6 animate-spin rounded-none border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentPlan = details?.plan || PLANS.free;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-foreground">
          BILLING // <span className="text-primary">SUBSCRIPTIONS & USAGE</span>
        </h1>
        <p className="text-xs text-muted-foreground font-mono">
          Manage operational subscription tier, metered usage allocations, and Stripe invoices.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-none border border-border bg-card p-5 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold uppercase font-mono tracking-tight text-foreground">
                {currentPlan.name} TIER
              </h2>
              <Badge variant={details?.status === 'active' ? 'lime' : 'amber'}>
                {details?.status || 'Active'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentPlan.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {details?.billingPortalUrl ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManagePortal}
                disabled={actionLoading}
              >
                MANAGE BILLING & INVOICES
              </Button>
            ) : (
              <Link href="/pricing">
                <Button size="sm">
                  UPGRADE TIER
                </Button>
              </Link>
            )}
          </div>
        </div>

        {details && (
          <div className="mt-4 border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
            Current billing period ends:{' '}
            <span className="font-bold text-foreground">
              {new Date(details.currentPeriodEnd).toLocaleDateString()}
            </span>
            {details.cancelAtPeriodEnd && (
              <span className="ml-2 text-amber-400 font-bold uppercase">
                (Cancels at period end)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quotas & Metered Usage */}
      {details && details.usage.length > 0 && (
        <div className="rounded-none border border-border bg-card p-5 shadow-none">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-3">
            METERED TELEMETRY & QUOTA CONSUMPTION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="rounded-none border border-border bg-card p-5 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              AVAILABLE OPERATIONAL TIERS
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Scale autonomous AI agent workflows and workspace quotas.
            </p>
          </div>

          <div className="flex items-center gap-1 mt-3 md:mt-0 bg-secondary p-1 border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-none ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-none ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ANNUAL (-20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={`rounded-none border p-4 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <Badge variant="lime">
                        ACTIVE
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-black text-foreground">
                      ${priceInDollars}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      /{billingCycle === 'annual' ? 'MO (BILLED ANNUALLY)' : 'MO'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs font-mono text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">▪</span>
                      {plan.features.ai_posts === -1
                        ? 'Unlimited'
                        : plan.features.ai_posts}{' '}
                      AI social posts / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">▪</span>
                      {plan.features.ai_articles === -1
                        ? 'Unlimited'
                        : plan.features.ai_articles}{' '}
                      AI blog articles / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">▪</span>
                      {plan.features.article_word_limit === -1
                        ? 'No word count limits'
                        : `${plan.features.article_word_limit.toLocaleString()} max words / article`}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">▪</span>
                      {plan.features.brand_voice_profiles === -1
                        ? 'Unlimited'
                        : plan.features.brand_voice_profiles}{' '}
                      Brand Voice profiles
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full opacity-60"
                    >
                      CURRENT TIER
                    </Button>
                  ) : planId === 'free' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full opacity-60"
                    >
                      DEFAULT TIER
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(planId as 'starter' | 'pro')}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      UPGRADE TO {plan.name}
                    </Button>
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
