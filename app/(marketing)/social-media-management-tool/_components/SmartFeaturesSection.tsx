"use client";

import { motion } from "framer-motion";
import { Globe, Bot, LayoutDashboard, Image as ImageIcon, Layers, TrendingUp, Sparkles } from "lucide-react";

const smartFeatures = [
  {
    icon: Globe,
    title: "Multi-Platform Dispatch",
    desc: "Coordinate posts for LinkedIn, X, Instagram, YouTube, and Facebook from one autonomous dashboard with per-channel calibration.",
    badge: "5 Channels",
  },
  {
    icon: Bot,
    title: "AI Swarm Generation",
    desc: "Generate high-resonance copy variants grounded in pgvector brand vectors. Select tones, inject hashtags, and calibrate engagement hooks.",
    badge: "pgvector RAG",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Queue Telemetry",
    desc: "Complete real-time overview of published, scheduled, failed, and drafted posts. Track delivery velocity and channel reach.",
    badge: "BullMQ Engine",
  },
  {
    icon: ImageIcon,
    title: "RAG Media Vector Library",
    desc: "Reuse verified brand assets, generate AI imagery, and organize high-resolution media with automatic aspect-ratio formatting.",
    badge: "Auto-Ratio",
  },
  {
    icon: Layers,
    title: "Reusable Blueprint Templates",
    desc: "Turn high-performing posts into reusable frameworks. Auto-fill recurring themes with updated seasonal trends and AI copy.",
    badge: "Templates",
  },
  {
    icon: TrendingUp,
    title: "Predictive Reach Analytics",
    desc: "Forecast impression velocity, audience retention curves, and engagement spikes before launching content into queues.",
    badge: "Real-time",
  },
];

export default function SmartFeaturesSection() {
  return (
    <section className="py-24 px-4 bg-muted/30 border-y border-border/60 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTONOMOUS SOCIAL FLEET</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Engineered for <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Compounding Audience Reach
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Scale your social growth with agentic precision without increasing manual operator headcount.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {smartFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="p-6 sm:p-7 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 text-left flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
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
