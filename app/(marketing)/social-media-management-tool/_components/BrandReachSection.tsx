"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Layers, Sparkles, ShieldCheck } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const platformFeatures = [
  {
    icon: Bot,
    title: "AI Voice Calibration",
    desc: "Effortlessly compose platform-adapted copy in verified brand tones grounded in pgvector brand embeddings.",
    badge: "100% Brand Tone Safe",
  },
  {
    icon: Zap,
    title: "Deterministic Dispatch",
    desc: "Publish across all connected social channels with one unified BullMQ transactional queue pipeline.",
    badge: "< 150ms Latency",
  },
  {
    icon: Layers,
    title: "Visual & Carousel Synthesis",
    desc: "Auto-format posts with rich aspect ratio previews, dynamic thumbnail rendering, and automated hashtags.",
    badge: "Multi-Ratio Ready",
  },
];

const platforms = [
  { icon: FaLinkedin, name: "LinkedIn", color: "text-blue-500", status: "OAuth 2.0 Connected" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-foreground", status: "API v2 Ready" },
  { icon: FaInstagram, name: "Instagram", color: "text-pink-500", status: "Graph API Ready" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-500", status: "Data API v3 Ready" },
  { icon: FaFacebook, name: "Facebook", color: "text-blue-600", status: "Page & Group Sync" },
];

export default function BrandReachSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CROSS-NETWORK DISPATCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Expand Your Brand&apos;s Reach <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Across Key Social Vectors
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Scale your content output with algorithmic timing, brand safety guardrails, and automated variant tuning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {platformFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="p-6 sm:p-7 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Platform Connectivity Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Multi-Channel Fleet Protocols
            </span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Networks Active
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {platforms.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/50 bg-background/50 text-center hover:border-primary/30 transition-colors"
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${p.color}`} />
                  <span className="text-xs font-bold text-foreground">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{p.status}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
