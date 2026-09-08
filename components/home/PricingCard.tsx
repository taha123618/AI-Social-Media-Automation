'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';
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
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative p-8 rounded-xl border flex flex-col justify-between transition-all duration-200 bg-card ${
        popular
          ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/30 z-10'
          : 'border-border/80 hover:border-border hover:shadow-md'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Most Popular</span>
        </div>
      )}

      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-1.5 tracking-tight">
            {name}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mb-6">
          <div className="h-6 flex items-center gap-2 mb-1">
            <AnimatePresence mode="wait">
              {billingCycle === 'year' && originalPrice && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm font-semibold text-muted-foreground/60 line-through">
                    {originalPrice}
                  </span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                    Save 20%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-baseline gap-1">
            <motion.span
              key={price}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl sm:text-5xl font-extrabold font-mono text-foreground tracking-tight"
            >
              {price}
            </motion.span>
            <span className="text-muted-foreground font-medium text-sm">
              /{billingCycle === 'month' ? 'mo' : 'mo'}
            </span>
          </div>
          {billingCycle === 'year' && (
            <p className="text-[11px] font-medium text-primary mt-1">
              Billed annually with instant quota access
            </p>
          )}
        </div>

        <div className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-snug">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-foreground/90 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSelectPlan}
        disabled={loading || businessLoading}
        variant={popular ? 'default' : 'outline'}
        className="w-full h-11 rounded-lg text-sm font-semibold transition-all"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {cta}
      </Button>
    </motion.div>
  );
};
