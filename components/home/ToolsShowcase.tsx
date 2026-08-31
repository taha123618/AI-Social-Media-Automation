"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  Layers,
  Mic,
  Bot,
  Radar,
  Swords,
  ShieldCheck,
  Webhook,
  PenTool,
  Hash,
  Sparkles,
  Zap,
  Target,
  Globe,
  Share2,
  Calendar,
  BarChart,
  FileText,
} from "lucide-react";
import React from "react";

const tools = [
  { name: "AI Visual Carousel Builder", icon: <Layers className="w-4 h-4 text-primary" />, category: "Visual" },
  { name: "AI Voice Cloning Studio", icon: <Mic className="w-4 h-4 text-purple-400" />, category: "Audio" },
  { name: "Brand Voice Guardian Linter", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, category: "Compliance" },
  { name: "24/7 DM Lead Qualifier Bot", icon: <Bot className="w-4 h-4 text-blue-400" />, category: "Automation" },
  { name: "Competitor Sentiment Radar", icon: <Radar className="w-4 h-4 text-amber-500" />, category: "Intelligence" },
  { name: "Multi-Model Comparison Arena", icon: <Swords className="w-4 h-4 text-primary" />, category: "AI Models" },
  { name: "Enterprise Webhooks Gateway", icon: <Webhook className="w-4 h-4 text-purple-400" />, category: "Integration" },
  { name: "Viral X Thread Engine", icon: <FaXTwitter className="w-4 h-4 text-foreground" />, category: "Social" },
  { name: "LinkedIn Post Formatter", icon: <FaLinkedin className="w-4 h-4 text-accent" />, category: "Professional" },
  { name: "YouTube Script Generator", icon: <FaYoutube className="w-4 h-4 text-red-500" />, category: "Video" },
  { name: "Hashtag Semantic Miner", icon: <Hash className="w-4 h-4 text-primary" />, category: "Growth" },
  { name: "Shorts & Reels Hook Crafter", icon: <Zap className="w-4 h-4 text-amber-500" />, category: "Video" },
  { name: "Topical Content Multiplier", icon: <Target className="w-4 h-4 text-primary" />, category: "Efficiency" },
  { name: "SEO Metadata & Schema Tuner", icon: <Globe className="w-4 h-4 text-emerald-500" />, category: "SEO" },
  { name: "High-CTR Ad Copy Variants", icon: <PenTool className="w-4 h-4 text-purple-400" />, category: "Marketing" },
  { name: "Gutenberg Long-Form Blog Writer", icon: <FileText className="w-4 h-4 text-accent" />, category: "Growth" },
];

const categoryColors: Record<string, string> = {
  Visual: "text-primary bg-primary/8 border-primary/20",
  Audio: "text-purple-400 bg-purple-500/8 border-purple-500/20",
  Compliance: "text-emerald-500 bg-emerald-500/8 border-emerald-500/20",
  Automation: "text-blue-400 bg-blue-500/8 border-blue-500/20",
  Intelligence: "text-amber-400 bg-amber-500/8 border-amber-500/20",
  "AI Models": "text-primary bg-primary/8 border-primary/20",
  Integration: "text-purple-400 bg-purple-500/8 border-purple-500/20",
  Social: "text-primary bg-primary/8 border-primary/20",
  Professional: "text-accent bg-accent/8 border-accent/20",
  Video: "text-red-400 bg-red-500/8 border-red-500/20",
  Growth: "text-emerald-500 bg-emerald-500/8 border-emerald-500/20",
  Efficiency: "text-primary bg-primary/8 border-primary/20",
  SEO: "text-emerald-500 bg-emerald-500/8 border-emerald-500/20",
  Marketing: "text-purple-400 bg-purple-500/8 border-purple-500/20",
};

export default function ToolsShowcase() {
  return (
    <section id="tools" className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 text-center max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            SPECIALIZED AGENTIC TOOLKIT
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Next-Gen Suite to <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Supercharge Production
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            From viral visual carousels and speech synthesis to 24/7 DM lead bots and competitor sentiment radars.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
              className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-150 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border/60">
                  {tool.icon}
                </div>
                <span className="font-semibold text-xs text-foreground tracking-tight">
                  {tool.name}
                </span>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  categoryColors[tool.category] || "text-muted-foreground bg-muted border-border"
                }`}
              >
                {tool.category}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
