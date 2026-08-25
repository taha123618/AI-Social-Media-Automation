"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import { User, Users, Building2, CheckCircle2 } from "lucide-react";
import React from "react";

const personas = [
  {
    title: "Solo Founders & Creators",
    description: "Build an authoritative personal brand without hiring an agency. SocialAI functions as your dedicated ghostwriter, trend scout, and distributor.",
    icon: <User className="w-5 h-5 text-primary" />,
    stats: "+240% Reach Velocity",
    benefits: ["Deterministic Voice Fine-Tuning", "Autonomous Cross-Network Scheduling", "Visual Post Previews"],
  },
  {
    title: "Agencies & Growth Fleets",
    description: "Operate 50+ client workspaces with unified billing and zero context mixing. Let autonomous agents produce initial drafts while your team directs strategy.",
    icon: <Users className="w-5 h-5 text-accent" />,
    stats: "5x Content Throughput",
    benefits: ["Client Review & Approval Gates", "Bulk Editorial Scheduling", "Custom Webhook Dispatch"],
  },
  {
    title: "Enterprise SaaS Brands",
    description: "Scale localized, brand-safe blog articles and product announcements across global regions with automated RAG grounding.",
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    stats: "99.9% Tone Adherence",
    benefits: ["Gutenberg HTML CMS Export", "pgvector Tone Grounding", "Role-Based Access Control"],
  },
];

export default function UseCases() {
  return (
    <section id="solutions" className="py-24 bg-muted/20 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            TARGET USE CASES
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Architected for <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Every Scale of Operation
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Whether launching a bootstrapped product or scaling enterprise organic search, our multi-agent fleet adapts to your exact operational requirements.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {personas.map((persona, idx) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="p-6 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {persona.icon}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {persona.stats}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2">
                  {persona.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {persona.description}
                </p>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                {persona.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
