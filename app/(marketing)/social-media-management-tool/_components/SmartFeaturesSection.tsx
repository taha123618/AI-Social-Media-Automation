"use client";

import { motion } from "framer-motion";
import { Globe, Bot, LayoutDashboard, Image, Layers } from "lucide-react";

const smartFeatures = [
  {
    icon: Globe,
    title: "Multi-Platform Dispatch",
    desc: "Coordinate posts for LinkedIn, X, Instagram, YouTube, and Facebook from one autonomous dashboard. Synchronize campaigns with optimal per-channel timing.",
  },
  {
    icon: Bot,
    title: "Mastra Swarm Generation",
    desc: "Generate high-resonance copy variants grounded in pgvector brand vectors. Select tones, inject hashtags, and calibrate engagement hooks.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Queue Telemetry",
    desc: "Complete real-time overview of published, scheduled, failed, and drafted posts. Track delivery velocity and channel reach.",
  },
  {
    icon: Image,
    title: "RAG Media Vector Library",
    desc: "Reuse verified brand assets, generate AI imagery, and organize high-resolution assets with automatic aspect-ratio formatting.",
  },
  {
    icon: Layers,
    title: "Reusable Blueprint Templates",
    desc: "Turn high-performing posts into reusable frameworks. Auto-fill recurring themes with updated seasonal trends and AI copy.",
  },
];

export default function SmartFeaturesSection() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            AUTONOMOUS SOCIAL FLEET
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Engineered for <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Compounding Audience Reach
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Scale your social growth without increasing manual operator headcount.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {smartFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="p-6 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200 text-left flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
