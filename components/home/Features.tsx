"use client";

import { motion } from "framer-motion";
import { Bot, Zap, MessageSquare, BarChart3, Globe, Shield, ArrowUpRight } from "lucide-react";
import React from "react";

const features = [
  {
    title: "AI Blog Writer & Gutenberg CMS",
    description: "Compose SEO-optimized long-form articles that rank. Multi-agent research, heading structures, and 1-click CMS exports.",
    icon: <Bot className="w-5 h-5 text-primary" />,
    badge: "AGENTIC CMS",
    accentColor: "primary",
  },
  {
    title: "Multi-Channel Social Fleet",
    description: "Autonomous scheduling for Twitter, LinkedIn, Instagram, and TikTok with optimal timing algorithms.",
    icon: <MessageSquare className="w-5 h-5 text-accent" />,
    badge: "AUTO-DISPATCH",
    accentColor: "accent",
  },
  {
    title: "Conversion Ad Copy Engine",
    description: "Synthesize high-converting ad copy variants for Meta, Google, and TikTok built on tested copywriting frameworks.",
    icon: <Zap className="w-5 h-5 text-purple-400" />,
    badge: "AD OPTIMIZER",
    accentColor: "purple",
  },
  {
    title: "Predictive Analytics & Attribution",
    description: "Analyze performance trajectory, engagement resonance, and revenue ROI attribution across every published vector.",
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    badge: "ATTRIBUTION",
    accentColor: "primary",
  },
  {
    title: "Brand Voice RAG Vector Store",
    description: "Isolated pgvector context layers ensure deterministic tone adherence and zero hallucinations across brand content.",
    icon: <Shield className="w-5 h-5 text-accent" />,
    badge: "PGVECTOR RAG",
    accentColor: "accent",
  },
  {
    title: "Global Multi-Region Localization",
    description: "Automatically adapt content for 40+ locales with cultural nuance, localized hashtags, and multilingual SEO metadata.",
    icon: <Globe className="w-5 h-5 text-purple-400" />,
    badge: "40+ LOCALES",
    accentColor: "purple",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              INTELLIGENT CAPABILITIES
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Autonomous Engine. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Compounding Organic Reach.
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Eliminate repetitive marketing workflows with enterprise-grade multi-agent orchestration.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 flex flex-col justify-between cursor-default"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200">
                <span>Explore Capability</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
