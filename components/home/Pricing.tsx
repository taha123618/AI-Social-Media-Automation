"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import React, { useState } from "react";
import { PricingCard } from "./PricingCard";
import { PricingToggle } from "./PricingToggle";
import { plans } from "@/utils/plans";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

  return (
    <section id="pricing" className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-[#020617] dark:text-white mb-6 tracking-tighter"
          >
            Simple, <span className="text-[#2D46FF] dark:text-blue-500">transparent</span> pricing
          </motion.h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-bold mb-12">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>

          <PricingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans[billingCycle].map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              billingCycle={billingCycle}
            />
          ))}
        </motion.div>

        <div className="mt-20 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 italic opacity-50">Need a custom plan for your enterprise?</p>
          <button className="text-[#2D46FF] dark:text-blue-400 font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
            Talk to our experts →
          </button>
        </div>
      </div>
    </section>
  );
}
