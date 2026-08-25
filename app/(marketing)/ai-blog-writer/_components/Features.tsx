"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain, Search, FileText, Shield, Zap, Globe, BarChart3, ArrowRight
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Semantic Swarm Research",
    description: "Multi-agent research parses topical depth and search intent to formulate exhaustive outline hierarchies.",
  },
  {
    icon: Search,
    title: "Real-Time 100-Point SEO Scorer",
    description: "Live heuristics evaluate heading balance, keyword density, meta descriptions, and readability indices.",
  },
  {
    icon: FileText,
    title: "Gutenberg HTML Serialization",
    description: "Generates clean semantic WordPress Gutenberg block comments, callout panels, and code fences ready for copy-paste.",
  },
  {
    icon: Shield,
    title: "pgvector Tone Grounding",
    description: "Embeddings ensure strict brand guidelines, preventing ungrounded claims and repetitive AI phrasing.",
  },
  {
    icon: Zap,
    title: "1-Click Direct CMS Export",
    description: "Sync articles directly to WordPress REST endpoints, Ghost, Webflow, Shopify, or Notion databases.",
  },
  {
    icon: Globe,
    title: "40+ Locale Adaptation",
    description: "Translate and localize long-form articles with culturally nuanced search terms and regional SEO tags.",
  },
  {
    icon: BarChart3,
    title: "Attribution & Ranking Tracking",
    description: "Monitor indexation velocity, organic keyword ranks, and pipeline revenue attribution in real time.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            TECHNICAL ARCHITECTURE
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Built for Content Velocity & <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Organic Search Dominance
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Every feature is engineered for high-intent topical authority and deterministic CMS integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
