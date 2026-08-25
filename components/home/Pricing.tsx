"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import React, { useState } from "react";
import { PricingCard } from "./PricingCard";
import { PricingToggle } from "./PricingToggle";
import { plans } from "@/utils/plans";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

  return (
    <section id="pricing" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            TRANSPARENT PLANS
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight"
          >
            Predictable Pricing. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              No Hidden Overages.
            </span>
          </motion.h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Deploy your AI marketing fleet today with a 14-day free trial on all paid plans.
          </p>

          <PricingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch"
        >
          {plans[billingCycle].map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              billingCycle={billingCycle}
            />
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm font-medium mb-3">
            Looking for custom seat quotas, on-premise deployments, or dedicated SLA guarantees?
          </p>
          <Link
            href="/talk-to-sales"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all"
          >
            <span>Consult Enterprise Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
