'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSubscriptionDetails } from '@/features/billing/types';
import { PLANS } from '@/features/billing/config/plans.config';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Check, CreditCard, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
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
      <div className="flex min-h-[400px] items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">Loading subscription details...</span>
      </div>
    );
  }

  const currentPlan = details?.plan || PLANS.free;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            Billing & Subscriptions
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your organization&apos;s subscription plan, track monthly consumption quotas, and view invoices.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground">
                {currentPlan.name} Plan
              </h2>
              <Badge variant="default" className="text-[10px] font-mono uppercase">
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
                className="text-xs font-semibold rounded-lg"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Manage Invoices & Payment
              </Button>
            ) : (
              <Link href="/pricing">
                <Button size="sm" className="text-xs font-semibold rounded-lg">
                  <span>Upgrade Plan</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {details && (
          <div className="mt-5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            Current billing period ends on{' '}
            <span className="font-semibold text-foreground font-mono">
              {new Date(details.currentPeriodEnd).toLocaleDateString()}
            </span>
            {details.cancelAtPeriodEnd && (
              <span className="ml-2 text-destructive font-semibold">
                (Cancels at period end)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quotas & Metered Usage */}
      {details && details.usage.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Monthly Consumption & Quota Telemetry
            </h3>
          </div>
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
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Available Scaling Plans
            </h3>
            <p className="text-xs text-muted-foreground">
              Scale your autonomous agent swarms and generation quotas seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                billingCycle === 'annual'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
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
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-primary ring-1 ring-primary/40 bg-primary/5'
                    : 'border-border/80 bg-card hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <Badge variant="default" className="text-[10px] font-mono">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-foreground">
                      ${priceInDollars}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      /{billingCycle === 'annual' ? 'mo billed annually' : 'mo'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>

                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90 font-medium">
                        {plan.features.ai_posts === -1 ? 'Unlimited' : plan.features.ai_posts} AI Posts / mo
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90 font-medium">
                        {plan.features.ai_articles === -1 ? 'Unlimited' : plan.features.ai_articles} Articles / mo
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90 font-medium">
                        {plan.features.article_word_limit === -1
                          ? 'No word count limit'
                          : `${plan.features.article_word_limit.toLocaleString()} max words / article`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90 font-medium">
                        {plan.features.brand_voice_profiles === -1
                          ? 'Unlimited'
                          : plan.features.brand_voice_profiles} Brand Voice profiles
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      disabled
                      size="sm"
                      className="w-full text-xs font-semibold rounded-lg"
                    >
                      Current Plan
                    </Button>
                  ) : planId === 'free' ? (
                    <Button
                      variant="outline"
                      disabled
                      size="sm"
                      className="w-full text-xs font-semibold rounded-lg"
                    >
                      Default Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(planId as 'starter' | 'pro')}
                      disabled={actionLoading}
                      size="sm"
                      className="w-full text-xs font-semibold rounded-lg"
                    >
                      {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                      Upgrade to {plan.name}
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
