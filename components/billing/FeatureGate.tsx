'use client';

import React from 'react';
import { FeatureKey, PlanId, PLANS } from '@/features/billing/config/plans.config';
import { useEntitlements } from '@/hooks/use-entitlements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: FeatureKey;
  userPlan?: PlanId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  userPlan,
  children,
  fallback,
}: FeatureGateProps) {
  const { planId: dynamicPlanId, hasAccess: checkDynamicAccess, isLoading } = useEntitlements(feature);

  // If userPlan is passed explicitly, use it; otherwise use dynamic resolved plan
  const effectivePlanId: PlanId = userPlan || dynamicPlanId || 'free';
  const effectivePlan = PLANS[effectivePlanId] || PLANS.free;

  const hasAccess = userPlan
    ? (() => {
        const featureVal = effectivePlan.features[feature];
        if (typeof featureVal === 'boolean') return featureVal;
        if (typeof featureVal === 'number') return featureVal === -1 || featureVal > 0;
        if (typeof featureVal === 'string') return featureVal !== 'none';
        return false;
      })()
    : checkDynamicAccess(feature);

  if (isLoading && !userPlan) {
    return (
      <div className="rounded-3xl border border-border bg-card/20 p-8 text-center animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-xl mx-auto mb-2" />
        <div className="h-4 w-72 bg-muted/60 rounded-xl mx-auto" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredPlanId: PlanId = PLANS.starter.features[feature] ? 'starter' : 'pro';
  const requiredPlan = PLANS[requiredPlanId] || PLANS.starter;

  return (
    <div className="rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
        <Lock className="h-7 w-7" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold border-primary/30 text-primary px-2.5 py-0.5">
          {requiredPlan.name} Feature
        </Badge>
      </div>

      <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
        Unlock {feature.replace(/_/g, ' ').toUpperCase()}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground font-medium">
        This capability is active on the <span className="font-bold text-foreground">{requiredPlan.name} Plan</span> and above.
        Upgrade your workspace to enable full access.
      </p>

      <div className="mx-auto my-6 max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-muted-foreground">
        {requiredPlan.highlights.slice(0, 4).map((highlight, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/30 border border-border/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">{highlight}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button asChild className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2">
          <Link href="/pricing">
            <Sparkles className="h-4 w-4" />
            <span>Upgrade to {requiredPlan.name}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
