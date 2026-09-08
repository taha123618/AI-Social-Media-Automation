"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaYoutube } from "react-icons/fa";
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
  FileText,
  ArrowUpRight,
  Cpu,
  Flame,
} from "lucide-react";

// ============================================================================
// Tool Interface and Dataset
// ============================================================================
interface ToolItem {
  name: string;
  category: string;
  filterGroup: "Visual & Audio" | "Automation & Bots" | "Intelligence & Compliance" | "Growth & Content";
  description: string;
  icon: React.ReactNode;
  telemetry: string;
  badge: string;
}

const toolsData: ToolItem[] = [
  {
    name: "AI Visual Carousel Studio",
    category: "Visual",
    filterGroup: "Visual & Audio",
    description: "Multi-slide LinkedIn PDF carousels & Instagram swipe decks with 6 themes.",
    icon: <Layers className="w-4 h-4 text-primary" />,
    telemetry: "6 THEMES • PDF/PNG",
    badge: "CAROUSEL",
  },
  {
    name: "AI Voice Cloning Studio",
    category: "Audio",
    filterGroup: "Visual & Audio",
    description: "Instant studio-grade audio narration in 6 distinct timbres for Reels & Shorts.",
    icon: <Mic className="w-4 h-4 text-purple-400" />,
    telemetry: "6 VOICES • HD AUDIO",
    badge: "VOICE",
  },
  {
    name: "Brand Voice Guardian",
    category: "Compliance",
    filterGroup: "Intelligence & Compliance",
    description: "Real-time copy linter analyzing readability, character limits & tone adherence.",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    telemetry: "REAL-TIME LINTER",
    badge: "GUARDIAN",
  },
  {
    name: "24/7 DM Lead Qualifier Bot",
    category: "Automation",
    filterGroup: "Automation & Bots",
    description: "Conversational AI responder for IG, LinkedIn & FB DMs booking calendar slots.",
    icon: <Bot className="w-4 h-4 text-blue-400" />,
    telemetry: "24/7 AUTONOMOUS",
    badge: "LEAD BOT",
  },
  {
    name: "Competitor Sentiment Radar",
    category: "Intelligence",
    filterGroup: "Intelligence & Compliance",
    description: "Real-time tracking of brand mentions, sentiment shifts & share of voice.",
    icon: <Radar className="w-4 h-4 text-amber-500" />,
    telemetry: "X • REDDIT • LINKEDIN",
    badge: "RADAR",
  },
  {
    name: "Multi-Model Comparison Arena",
    category: "AI Models",
    filterGroup: "Intelligence & Compliance",
    description: "Side-by-side benchmarking across Claude 3.5, GPT-4o, DeepSeek-R1 & Gemini.",
    icon: <Swords className="w-4 h-4 text-primary" />,
    telemetry: "LIVE TOKEN TELEMETRY",
    badge: "ARENA",
  },
  {
    name: "Enterprise Webhooks Gateway",
    category: "Integration",
    filterGroup: "Automation & Bots",
    description: "HMAC SHA-256 signed event dispatching to Zapier, Make or custom endpoints.",
    icon: <Webhook className="w-4 h-4 text-purple-400" />,
    telemetry: "HMAC SHA-256",
    badge: "GATEWAY",
  },
  {
    name: "Viral X Thread Engine",
    category: "Social",
    filterGroup: "Growth & Content",
    description: "High-hook 5-to-10 tweet sequences engineered for algorithmic reach.",
    icon: <FaXTwitter className="w-4 h-4 text-foreground" />,
    telemetry: "ALGO-OPTIMIZED",
    badge: "THREADS",
  },
  {
    name: "LinkedIn Post Formatter",
    category: "Professional",
    filterGroup: "Growth & Content",
    description: "Clean readability spacing, hook styling & unicode emphasis for B2B reach.",
    icon: <FaLinkedin className="w-4 h-4 text-accent" />,
    telemetry: "B2B ENGAGEMENT",
    badge: "FORMATTER",
  },
  {
    name: "YouTube Script Generator",
    category: "Video",
    filterGroup: "Visual & Audio",
    description: "Full retention-optimized video scripts with timestamps, hooks & B-roll cues.",
    icon: <FaYoutube className="w-4 h-4 text-red-500" />,
    telemetry: "RETENTION CURVES",
    badge: "SCRIPTS",
  },
  {
    name: "Hashtag Semantic Miner",
    category: "Growth",
    filterGroup: "Growth & Content",
    description: "Vector-driven semantic clustering of high-traffic and low-competition tags.",
    icon: <Hash className="w-4 h-4 text-primary" />,
    telemetry: "SEMANTIC CLUSTERS",
    badge: "TAGS",
  },
  {
    name: "Shorts & Reels Hook Crafter",
    category: "Video",
    filterGroup: "Visual & Audio",
    description: "3-second pattern interrupt visual and verbal hooks proven to lift retention.",
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    telemetry: "3S INTERRUPTS",
    badge: "HOOKS",
  },
  {
    name: "Topical Content Multiplier",
    category: "Automation",
    filterGroup: "Automation & Bots",
    description: "Turn 1 core concept into 24 multi-channel posts, tweets, threads & scripts.",
    icon: <Target className="w-4 h-4 text-primary" />,
    telemetry: "1-TO-24 MULTIPLIER",
    badge: "SCALE",
  },
  {
    name: "SEO Metadata & Schema Tuner",
    category: "SEO",
    filterGroup: "Growth & Content",
    description: "Automated JSON-LD schemas, OpenGraph previews & SERP snippet scoring.",
    icon: <Globe className="w-4 h-4 text-emerald-500" />,
    telemetry: "JSON-LD SCHEMA",
    badge: "SCHEMA",
  },
  {
    name: "High-CTR Ad Copy Variants",
    category: "Marketing",
    filterGroup: "Growth & Content",
    description: "PAS, AIDA & Problem-Agitate copy variations tailored for Meta and Google Ads.",
    icon: <PenTool className="w-4 h-4 text-purple-400" />,
    telemetry: "AIDA / PAS COPY",
    badge: "ADS",
  },
  {
    name: "Gutenberg Long-Form Blog Writer",
    category: "Growth",
    filterGroup: "Growth & Content",
    description: "Semantic 3,000+ word deep-dives formatted directly for WordPress blocks.",
    icon: <FileText className="w-4 h-4 text-accent" />,
    telemetry: "GUTENBERG READY",
    badge: "BLOG",
  },
];

const filterCategories = [
  "All",
  "Visual & Audio",
  "Automation & Bots",
  "Intelligence & Compliance",
  "Growth & Content",
] as const;

export default function ToolsShowcase() {
  const [activeFilter, setActiveFilter] = useState<typeof filterCategories[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesCategory =
        activeFilter === "All" || tool.filterGroup === activeFilter;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <section id="tools" className="py-28 bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-primary/8 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-1/4 w-[550px] h-[550px] bg-accent/8 dark:bg-accent/4 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Decorative Grid Texture */}
      <div
        className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] bg-[size:32px_32px] pointer-events-none -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(169,84,247,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(169,84,247,0.08) 1px, transparent 1px)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>SPECIALIZED AGENTIC TOOLKIT</span>
              <span className="text-foreground/40 font-normal">| 16 MODULES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight leading-tight">
              Next-Gen Tool Suite to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Supercharge Production.
              </span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Every specialized capability needed to ideate, synthesize, audit, schedule, and scale organic reach across all major networks.
            </p>
          </motion.div>

          {/* Filter Bar & Fast Search */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-muted/50 border border-border/80 backdrop-blur-md">
              {filterCategories.map((category) => {
                const isActive = activeFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeToolFilter"
                        className="absolute inset-0 bg-primary rounded-xl shadow-xs"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left"
        >
          <AnimatePresence>
            {filteredTools.map((tool, index) => (
              <motion.div
                layout
                key={tool.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                whileHover={{ y: -4 }}
                className="group relative p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top hover glow border */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-muted border border-border/70 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300 shadow-2xs">
                      {tool.icon}
                    </div>

                    <span className="text-[8px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 tracking-wider">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors tracking-tight mb-1.5 flex items-center justify-between">
                    <span>{tool.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-primary transition-all duration-200" />
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                {/* Card Footer Telemetry */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>{tool.telemetry}</span>
                  </div>
                  <span className="text-foreground/40 font-bold group-hover:text-primary transition-colors">
                    ACTIVE
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Platform Metrics Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 p-5 sm:p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                <span>Unified Enterprise Architecture</span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  99.9% UPTIME
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                All 16 tools synchronize directly into your BullMQ workers, pgvector semantic memory & PostgreSQL data store.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
            <div className="text-center sm:text-right">
              <div className="text-lg font-extrabold text-foreground tracking-tight">16+</div>
              <div className="text-[9px] text-muted-foreground">PRODUCTION TOOLS</div>
            </div>
            <div className="h-8 w-px bg-border/80" />
            <div className="text-center sm:text-right">
              <div className="text-lg font-extrabold text-primary tracking-tight">100%</div>
              <div className="text-[9px] text-muted-foreground">AUTONOMOUS</div>
            </div>
            <div className="h-8 w-px bg-border/80" />
            <div className="text-center sm:text-right">
              <div className="text-lg font-extrabold text-emerald-500 tracking-tight">0ms</div>
              <div className="text-[9px] text-muted-foreground">COLD START</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
