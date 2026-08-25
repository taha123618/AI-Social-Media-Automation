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
  Globe
} from "lucide-react";

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

export default function ToolsShowcase() {
  return (
    <section id="tools" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto mb-16"
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
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-left"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-secondary/80 text-foreground shrink-0 group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {tool.category}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
