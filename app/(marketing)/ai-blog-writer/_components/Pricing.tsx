"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    icon: Zap,
    name: "Starter",
    tagline: "Perfect for solo creators",
    monthlyPrice: 29,
    annualPrice: 19,
    color: "text-blue-400",
    cta: "Start free trial",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-foreground border border-border",
    features: [
      "20 AI articles per month",
      "Up to 3,000 words per article",
      "Real-time SEO scoring",
      "1 brand voice profile",
      "WordPress & Ghost export",
      "Basic analytics",
      "Email support",
    ],
    notIncluded: ["AI detection bypass", "Topical cluster mapping", "Custom integrations"],
  },
  {
    id: "pro",
    icon: Sparkles,
    name: "Pro",
    tagline: "Best for growing teams",
    monthlyPrice: 79,
    annualPrice: 49,
    color: "text-white",
    badge: "Most Popular",
    cta: "Start free trial",
    ctaStyle: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30",
    features: [
      "100 AI articles per month",
      "Up to 8,000 words per article",
      "Real-time SEO scoring",
      "5 brand voice profiles",
      "AI detection bypass",
      "One-click CMS publishing",
      "Topical cluster mapping",
      "Google Search Console sync",
      "Auto internal linking",
      "Priority support",
    ],
    notIncluded: ["Custom integrations", "Dedicated CSM"],
  },
  {
    id: "enterprise",
    icon: Building2,
    name: "Enterprise",
    tagline: "For large-scale content ops",
    monthlyPrice: null,
    annualPrice: null,
    color: "text-violet-400",
    cta: "Contact sales",
    ctaStyle: "bg-violet-600/20 hover:bg-violet-600/30 text-foreground border border-violet-500/30",
    features: [
      "Unlimited articles",
      "Unlimited word length",
      "Unlimited brand voices",
      "AI detection bypass",
      "All CMS integrations",
      "Custom API access",
      "White-label exports",
      "Topical cluster strategy",
      "Dedicated CSM",
      "SLA + priority support",
      "Custom model fine-tuning",
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-400 mb-6">
            <Sparkles className="h-4 w-4" />
            Simple Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Plans that grow{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              with your ambitions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start free. No credit card required. Cancel anytime.
          </p>

          <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl border border-border bg-card/50">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">-40%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                className={`relative p-8 rounded-3xl border border-border bg-card/50 flex flex-col`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div className="inline-flex p-3 rounded-2xl bg-muted border border-border mb-4">
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <h3 className={`text-2xl font-black mb-1 ${plan.color}`}>{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-8">
                  {price !== null ? (
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-foreground">${price}</span>
                      <span className="text-muted-foreground mb-2">/mo</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-foreground">Custom</div>
                  )}
                  {annual && price !== null && (
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      Billed annually — save ${((plan.monthlyPrice! - price) * 12).toLocaleString()}/yr
                    </p>
                  )}
                </div>

                <Link href={plan.id === "enterprise" ? "/contact" : "/blog"} className="block mb-8">
                  <button
                    className={`cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground line-through">
                      <span className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground">-</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
