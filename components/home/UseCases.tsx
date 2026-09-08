"use client";

import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import { User, Users, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const personas = [
  {
    title: "Solo Founders & Creators",
    description: "Build an authoritative personal brand without hiring an agency. SocialAI functions as your dedicated ghostwriter, trend scout, and distributor.",
    icon: <User className="w-5 h-5 text-primary" />,
    stat: { value: "+240%", label: "Reach Velocity" },
    benefits: ["Deterministic Voice Fine-Tuning", "Autonomous Cross-Network Scheduling", "Visual Post Previews"],
    cta: "Start for free",
    href: "/register",
  },
  {
    title: "Agencies & Growth Fleets",
    description: "Operate 50+ client workspaces with unified billing and zero context mixing. Let autonomous agents produce initial drafts while your team directs strategy.",
    icon: <Users className="w-5 h-5 text-accent" />,
    stat: { value: "5×", label: "Content Throughput" },
    benefits: ["Client Review & Approval Gates", "Bulk Editorial Scheduling", "Custom Webhook Dispatch"],
    cta: "Book demo",
    href: "/talk-to-sales",
    featured: true,
  },
  {
    title: "Enterprise SaaS Brands",
    description: "Scale localized, brand-safe blog articles and product announcements across global regions with automated RAG grounding.",
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    stat: { value: "99.9%", label: "Tone Adherence" },
    benefits: ["Gutenberg HTML CMS Export", "pgvector Tone Grounding", "Role-Based Access Control"],
    cta: "Talk to sales",
    href: "/talk-to-sales",
  },
];

export default function UseCases() {
  return (
    <section id="solutions" className="py-24 bg-background relative overflow-hidden">
      {/* Ambient glow left */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {personas.map((persona, idx) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`group p-6 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                persona.featured
                  ? "border-primary/40 bg-card shadow-xl shadow-primary/8 ring-1 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 shadow-xs"
              }`}
            >
              {persona.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {persona.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-extrabold text-foreground tracking-tight">
                      {persona.stat.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      {persona.stat.label}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 leading-snug">
                  {persona.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  {persona.description}
                </p>

                <div className="space-y-2 border-t border-border/60 pt-4 mb-6">
                  {persona.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href={persona.href} className="mt-auto">
                <Button
                  variant={persona.featured ? "default" : "outline"}
                  className="w-full h-9 rounded-lg text-xs font-semibold"
                >
                  {persona.cta}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
