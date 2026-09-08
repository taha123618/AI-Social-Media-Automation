"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Mic,
  Bot,
  Radar,
  Swords,
  ShieldCheck,
  Webhook,
  Sparkles,
  BarChart3,
} from "lucide-react";
import React from "react";

const features = [
  {
    title: "AI Visual Carousel Studio",
    description: "Transform articles and concepts into high-converting multi-slide LinkedIn PDF carousels and Instagram swipe decks with 6 modern design themes.",
    icon: <Layers className="w-5 h-5 text-primary" />,
    badge: "CAROUSEL STUDIO",
  },
  {
    title: "AI Voice Cloning & Narration",
    description: "Instant studio-grade audio narration and voiceovers in 6 distinct timbres. Perfect for Reels, TikToks, Shorts, and Audio Ads.",
    icon: <Mic className="w-5 h-5 text-purple-400" />,
    badge: "VOICE STUDIO",


  },
  {
    title: "Brand Voice & Style Guardian",
    description: "Real-time copy linter analyzing readability, platform character guidelines, forbidden terms, and tone adherence with 1-click polishing.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    badge: "REAL-TIME LINTER",
  },
  {
    title: "Autonomous DM & Lead Bot",
    description: "Conversational AI responder for Instagram, LinkedIn, and Facebook DMs. Qualifies sales leads and books meetings directly on your calendar.",
    icon: <Bot className="w-5 h-5 text-blue-400" />,
    badge: "24/7 LEAD BOT",
  },
  {
    title: "Social Listening & Sentiment Radar",
    description: "Real-time tracking of brand mentions, sentiment shifts, competitor share of voice, and trending topics across X, Reddit, and LinkedIn.",
    icon: <Radar className="w-5 h-5 text-amber-400" />,
    badge: "SENTIMENT RADAR",
  },
  {
    title: "AI Multi-Model Arena",
    description: "Side-by-side benchmarking across Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, and Gemini 2.0 with live latency and token cost telemetry.",
    icon: <Swords className="w-5 h-5 text-primary" />,
    badge: "MODEL ARENA",
  },
  {
    title: "Enterprise Webhooks Gateway",
    description: "Seamless HMAC SHA-256 signed event dispatching to Zapier, Make.com, or custom APIs with automated retry policies.",
    icon: <Webhook className="w-5 h-5 text-purple-400" />,
    badge: "API GATEWAY",
  },
  {
    title: "Autonomous Multi-Agent Workflows",
    description: "Weather-triggered campaigns, competitor counter-campaigns, and trend-jack pipelines running 100% autonomously via BullMQ.",
    icon: <Sparkles className="w-5 h-5 text-accent" />,
    badge: "SWARM AGENTS",
  },
  {
    title: "Predictive Analytics & Attribution",
    description: "Track organic engagement velocity, conversion ROI, and revenue attribution across every published asset.",
    icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
    badge: "ATTRIBUTION",
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
              NEXT-GEN SOCIAL AUTOMATION
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Autonomous AI Engine. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Compounding Organic Dominance.
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From visual carousel decks and voice narration to 24/7 conversational DM bots and competitor sentiment radars.
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
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 flex flex-col justify-between cursor-default"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
