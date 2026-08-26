"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Layers } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const platformFeatures = [
  { icon: Bot, title: "AI Voice Calibration", desc: "Effortlessly compose platform-adapted copy in verified brand tones." },
  { icon: Zap, title: "Deterministic Dispatch", desc: "Publish across all connected social channels with one unified pipeline." },
  { icon: Layers, title: "Visual & Carousel Synthesis", desc: "Auto-format posts with rich aspect ratio previews and hashtags." },
];

const platforms = [
  { icon: FaLinkedin, name: "LinkedIn", color: "text-primary" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-foreground" },
  { icon: FaInstagram, name: "Instagram", color: "text-accent" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-500" },
  { icon: FaFacebook, name: "Facebook", color: "text-blue-500" },
];

export default function BrandReachSection() {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            CROSS-NETWORK DISPATCH
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Expand Your Brand&apos;s Reach <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Across Key Social Vectors
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Scale your content output with algorithmic timing, brand safety guardrails, and automated variant tuning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {platformFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="p-6 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="p-6 rounded-xl bg-card border border-border/80 flex flex-wrap items-center justify-around gap-4 text-center">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
