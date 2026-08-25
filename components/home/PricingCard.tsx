'use client';

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCurrentBusiness } from '@/hooks/use-current-business';

interface PricingCardProps {
  id?: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlightColor?: string;
  billingCycle?: 'month' | 'year';
}

export const PricingCard = ({
  id = 'free',
  name,
  price,
  originalPrice,
  description,
  features,
  cta,
  popular = false,
  billingCycle = 'month',
}: PricingCardProps) => {
  const router = useRouter();
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (id === 'free') {
      if (businessId) {
        router.push('/dashboard');
      } else {
        router.push('/register');
      }
      return;
    }

    if (!businessId) {
      router.push(`/register?plan=${id}&cycle=${billingCycle === 'year' ? 'annual' : 'monthly'}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          planId: id,
          billingCycle: billingCycle === 'year' ? 'annual' : 'monthly',
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        router.push('/settings/billing');
      }
    } catch (err) {
      console.error('Failed to initiate checkout:', err);
      router.push('/settings/billing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative p-6 rounded-none border transition-none flex flex-col h-full bg-card ${
        popular
          ? 'border-primary bg-primary/5'
          : 'border-border'
      }`}
    >
      {popular && (
        <div
          className="absolute -top-3 left-4 text-primary-foreground bg-primary text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-none border border-primary"
        >
          RECOMMENDED TIER
        </div>
      )}

      <div className="mb-6 border-b border-border pb-4">
        <h3 className="text-base font-mono font-bold text-foreground uppercase tracking-wider mb-1">
          {name}
        </h3>
        <p className="text-muted-foreground text-xs font-normal">
          {description}
        </p>
      </div>

      <div className="mb-6">
        <div className="h-6 flex items-center gap-2 mb-1">
          {billingCycle === 'year' && originalPrice && (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice}
              </span>
              <span className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-primary/40">
                SAVE 20%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-4xl font-black text-foreground tracking-tight">
            {price}
          </span>
          <span className="text-muted-foreground text-xs uppercase font-bold">
            /{billingCycle === 'month' ? 'MO' : 'MO (ANNUAL)'}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mb-8 flex-grow">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <span className="text-primary font-bold text-sm leading-none shrink-0 mt-0.5">▪</span>
            <span className="text-foreground font-mono leading-tight">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSelectPlan}
        disabled={loading || businessLoading}
        variant={popular ? 'default' : 'outline'}
        size="lg"
        className="w-full"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {cta}
      </Button>
    </div>
  );
};
