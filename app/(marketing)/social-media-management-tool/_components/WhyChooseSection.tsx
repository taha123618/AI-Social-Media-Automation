"use client";

import { motion } from "framer-motion";
import { Zap, Globe, ShieldCheck, Bot, Sparkles, CheckCircle2 } from "lucide-react";

const whyChoose = [
  {
    icon: Bot,
    title: "Autonomous Multi-Agent Swarms",
    desc: "13 specialized AI agents working continuously to analyze trends, draft copy, calibrate tone, and schedule without manual bottlenecks.",
    highlight: "Autonomous Execution",
    badge: "13 AI Agents",
  },
  {
    icon: Globe,
    title: "Deterministic Cross-Platform Fleet",
    desc: "Built on high-reliability BullMQ queue pipelines with automatic rate-limit throttling, retry handling, and unified multi-network dispatch.",
    highlight: "Zero Dropped Posts",
    badge: "BullMQ Architecture",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Multi-Tenant Security",
    desc: "Strict cryptographic tenant isolation, secure OAuth 2.0 credential vaults, and verified brand safety compliance guardrails.",
    highlight: "Strict Boundary Isolation",
    badge: "Enterprise Security",
  },
  {
    icon: Zap,
    title: "Dynamic pgvector Brand Memory",
    desc: "Contextual RAG memory embeds your voice, tone guidelines, and historical top-performing posts to ensure compounding content resonance.",
    highlight: "Compounding Resonance",
    badge: "Vector RAG",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 px-4 bg-muted/30 border-y border-border/60 relative overflow-hidden transition-colors">
      {/* Subtle Ambient Radial Backdrops */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE SOCIALAI ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Why High-Growth Teams <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Choose SocialAI
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A modern autonomous infrastructure engineered to eliminate manual posting fatigue, preserve strict brand voice, and maximize multi-channel reach.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whyChoose.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-7 sm:p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
