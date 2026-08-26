"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  PenTool,
  Hash,
  Image as ImageIcon,
  Video,
  MessageSquare,
  FileText,
  BarChart,
  Calendar,
  Share2,
  Zap,
  Target,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tools = [
  { name: "Instagram Bio Gen", icon: <FaInstagram className="w-4 h-4 text-primary" />, category: "Social" },
  { name: "Viral X Thread Engine", icon: <FaXTwitter className="w-4 h-4 text-foreground" />, category: "Social" },
  { name: "LinkedIn Post Writer", icon: <FaLinkedin className="w-4 h-4 text-accent" />, category: "Professional" },
  { name: "YouTube Script Pro", icon: <FaYoutube className="w-4 h-4 text-red-500" />, category: "Video" },
  { name: "Hashtag Semantic Miner", icon: <Hash className="w-4 h-4 text-primary" />, category: "Growth" },
  { name: "Midjourney Visual Prompts", icon: <ImageIcon className="w-4 h-4 text-purple-400" />, category: "Creative" },
  { name: "Shorts & Reels Hook Studio", icon: <Zap className="w-4 h-4 text-amber-500" />, category: "Video" },
  { name: "Bio Link Conversion Tuner", icon: <Share2 className="w-4 h-4 text-accent" />, category: "Conversion" },
  { name: "Topical Content Multiplier", icon: <Target className="w-4 h-4 text-primary" />, category: "Efficiency" },
  { name: "SEO Metadata & Schema", icon: <Globe className="w-4 h-4 text-emerald-500" />, category: "SEO" },
  { name: "High-CTR Ad Copy Variants", icon: <PenTool className="w-4 h-4 text-purple-400" />, category: "Marketing" },
  { name: "Brand Voice Harmonizer", icon: <MessageSquare className="w-4 h-4 text-primary" />, category: "Creative" },
  { name: "Gutenberg Long-Form Writer", icon: <FileText className="w-4 h-4 text-accent" />, category: "Growth" },
  { name: "Predictive Resonance Scorer", icon: <BarChart className="w-4 h-4 text-primary" />, category: "Analytics" },
  { name: "Peak-Cadence Dispatcher", icon: <Calendar className="w-4 h-4 text-purple-400" />, category: "Strategy" },
  { name: "Video SEO Description Generator", icon: <Video className="w-4 h-4 text-red-500" />, category: "Video" },
];

const categoryColors: Record<string, string> = {
  Social: "text-primary bg-primary/8 border-primary/20",
  Professional: "text-accent bg-accent/8 border-accent/20",
  Video: "text-red-400 bg-red-500/8 border-red-500/20",
  Growth: "text-emerald-500 bg-emerald-500/8 border-emerald-500/20",
  Creative: "text-purple-400 bg-purple-500/8 border-purple-500/20",
  Conversion: "text-accent bg-accent/8 border-accent/20",
  Efficiency: "text-primary bg-primary/8 border-primary/20",
  SEO: "text-emerald-500 bg-emerald-500/8 border-emerald-500/20",
  Marketing: "text-purple-400 bg-purple-500/8 border-purple-500/20",
  Analytics: "text-primary bg-primary/8 border-primary/20",
  Strategy: "text-purple-400 bg-purple-500/8 border-purple-500/20",
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
            SPECIALIZED SKILL TOOLKIT
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            80+ AI Micro-Tools to <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Supercharge Production
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            From viral hooks to deep technical data, we&apos;ve automated every step of your multi-channel growth pipeline.
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
              transition={{ duration: 0.2, delay: index * 0.025, ease: [0.16, 1, 0.3, 1] }}
              className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-secondary/80 shrink-0 group-hover:scale-110 transition-transform duration-200">
                {tool.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {tool.name}
                </div>
                <div className={`text-[10px] font-mono font-semibold mt-0.5 px-1.5 py-0.5 rounded-full border w-fit ${categoryColors[tool.category] ?? "text-muted-foreground bg-muted border-border/50"}`}>
                  {tool.category}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/register">
            <Button size="lg" className="h-11 px-7 rounded-lg text-sm font-semibold shadow-md shadow-primary/20">
              <span>Explore All 80+ Tools</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            No credit card required · 14-day free trial
          </p>
        </motion.div>
      </div>
    </section>
  );
}
