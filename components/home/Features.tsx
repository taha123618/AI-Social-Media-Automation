"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  Layers,
  Mic,
  ShieldCheck,
  Bot,
  Radar,
  Swords,
  Webhook,
  Sparkles,
  BarChart3,
  ArrowRight,
  Cpu,
} from "lucide-react";

// ============================================================================
// Original 9 Features Dataset from the Project
// ============================================================================
interface ProjectFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}

const allFeatures: ProjectFeature[] = [
  {
    title: "AI Visual Carousel Studio",
    description:
      "Transform articles and concepts into high-converting multi-slide LinkedIn PDF carousels and Instagram swipe decks with 6 modern design themes.",
    icon: <Layers className="w-4 h-4 text-primary" />,
    badge: "CAROUSEL STUDIO",
  },
  {
    title: "AI Voice Cloning & Narration",
    description:
      "Instant studio-grade audio narration and voiceovers in 6 distinct timbres. Perfect for Reels, TikToks, Shorts, and Audio Ads.",
    icon: <Mic className="w-4 h-4 text-purple-400" />,
    badge: "VOICE STUDIO",
  },
  {
    title: "Autonomous Multi-Agent Workflows",
    description:
      "Weather-triggered campaigns, competitor counter-campaigns, and trend-jack pipelines running 100% autonomously via BullMQ.",
    icon: <Sparkles className="w-4 h-4 text-accent" />,
    badge: "SWARM AGENTS",
  },
  {
    title: "Autonomous DM & Lead Bot",
    description:
      "Conversational AI responder for Instagram, LinkedIn, and Facebook DMs. Qualifies sales leads and books meetings directly on your calendar.",
    icon: <Bot className="w-4 h-4 text-blue-400" />,
    badge: "24/7 LEAD BOT",
  },
  {
    title: "Social Listening & Sentiment Radar",
    description:
      "Real-time tracking of brand mentions, sentiment shifts, competitor share of voice, and trending topics across X, Reddit, and LinkedIn.",
    icon: <Radar className="w-4 h-4 text-amber-400" />,
    badge: "SENTIMENT RADAR",
  },
  {
    title: "Predictive Analytics & Attribution",
    description:
      "Track organic engagement velocity, conversion ROI, and revenue attribution across every published asset.",
    icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
    badge: "ATTRIBUTION",
  },
  {
    title: "Brand Voice & Style Guardian",
    description:
      "Real-time copy linter analyzing readability, platform character guidelines, forbidden terms, and tone adherence with 1-click polishing.",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    badge: "REAL-TIME LINTER",
  },
  {
    title: "AI Multi-Model Arena",
    description:
      "Side-by-side benchmarking across Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, and Gemini 2.0 with live latency and token cost telemetry.",
    icon: <Swords className="w-4 h-4 text-primary" />,
    badge: "MODEL ARENA",
  },
  {
    title: "Enterprise Webhooks Gateway",
    description:
      "Seamless HMAC SHA-256 signed event dispatching to Zapier, Make.com, or custom APIs with automated retry policies.",
    icon: <Webhook className="w-4 h-4 text-purple-400" />,
    badge: "API GATEWAY",
  },
];

// ============================================================================
// 3 Card Suites (Grouping the 9 Project Features)
// ============================================================================
interface CardSuite {
  suiteNumber: string;
  suiteBadge: string;
  features: ProjectFeature[];
}

const cardSuites: CardSuite[] = [
  {
    suiteNumber: "01",
    suiteBadge: "Generative Content Creation",
    features: [allFeatures[0], allFeatures[1], allFeatures[2]],
  },
  {
    suiteNumber: "02",
    suiteBadge: "Conversational Growth & Radar",
    features: [allFeatures[3], allFeatures[4], allFeatures[5]],
  },
  {
    suiteNumber: "03",
    suiteBadge: "Compliance & Multi-Model Engine",
    features: [allFeatures[6], allFeatures[7], allFeatures[8]],
  },
];

// ============================================================================
// Mockup 1: Carousel Studio & Generative Audio Mockup
// ============================================================================
function CarouselStudioMockup({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between font-mono text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground/80 tracking-[0.15em] font-black text-[9px] sm:text-[10px]">
            {activeIndex === 0
              ? "CAROUSEL_STUDIO_V2"
              : activeIndex === 1
              ? "VOICE_CLONING_STUDIO"
              : "BULLMQ_SWARM_PIPELINE"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Dynamic Content depending on selected feature */}
      {activeIndex === 0 && (
        <div className="my-auto space-y-2 py-1">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((slideNum) => (
              <div
                key={slideNum}
                className="bg-card border border-border/80 rounded-lg p-2 flex flex-col justify-between h-20 shadow-xs"
              >
                <div className="text-[7px] text-primary font-bold">SLIDE #{slideNum}</div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-muted rounded w-full" />
                  <div className="h-1.5 bg-muted/60 rounded w-3/4" />
                </div>
                <div className="text-[6px] text-muted-foreground font-mono">1080x1350</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-primary/10 rounded-lg text-[8px] font-semibold text-primary">
            <span>6 Modern Design Themes Ready</span>
            <span className="underline cursor-pointer">Export PDF / PNG</span>
          </div>
        </div>
      )}

      {activeIndex === 1 && (
        <div className="my-auto space-y-2.5 py-1">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[8px] text-purple-600 dark:text-purple-300 font-bold">
              <span>VOICEOVER TIMBRES</span>
              <span>6 PRESETS ACTIVE</span>
            </div>
            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[40, 75, 25, 90, 60, 85, 30, 95, 50, 70, 45, 80].map((height, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${height * 0.4}%`, `${height}%`, `${height * 0.3}%`] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                  className="w-1.5 bg-gradient-to-t from-primary to-purple-400 rounded-full"
                />
              ))}
            </div>
          </div>
          <div className="text-[8px] text-center text-muted-foreground font-mono">
            Direct sync for Reels, TikToks & YouTube Shorts
          </div>
        </div>
      )}

      {activeIndex === 2 && (
        <div className="my-auto space-y-2 py-1">
          {[
            { name: "weather-trigger-job", status: "Running", color: "text-emerald-500" },
            { name: "competitor-counter-campaign", status: "Queued", color: "text-primary" },
            { name: "trend-jack-pipeline", status: "Active", color: "text-blue-400" },
          ].map((job) => (
            <div
              key={job.name}
              className="flex items-center justify-between p-2 bg-card border border-border/80 rounded-lg text-[8px]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="font-bold text-foreground">{job.name}</span>
              </div>
              <span className={`font-mono font-bold ${job.color}`}>{job.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer CPU */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/15">
        <span className="text-[8px] sm:text-[9px] font-bold text-foreground/80">
          AUTONOMOUS RUNTIME
        </span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Cpu className="w-4 h-4 text-primary" />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Mockup 2: DM Lead Bot & Sentiment Radar Mockup
// ============================================================================
function LeadBotMockup({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground/80 tracking-[0.15em] font-black text-[9px] sm:text-[10px]">
            {activeIndex === 0
              ? "24_7_LEAD_BOT_ENGINE"
              : activeIndex === 1
              ? "SENTIMENT_RADAR_SCANNER"
              : "REVENUE_ATTRIBUTION_ANALYTICS"}
          </span>
        </div>
        <span className="text-[8px] text-emerald-500 font-bold">ONLINE</span>
      </div>

      {activeIndex === 0 && (
        <div className="my-auto space-y-2 py-1">
          <div className="bg-muted/40 border border-border/80 rounded-xl p-2.5 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-foreground">
                U
              </div>
              <div className="bg-card border border-border/60 p-2 rounded-lg text-[8px] text-foreground">
                Can I see a live demo for our agency?
              </div>
            </div>
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg text-[8px] font-medium shadow-xs">
                Booked! Thursday 2:00 PM is saved on your calendar.
              </div>
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px]">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            </div>
          </div>
          <div className="text-[8px] text-center text-muted-foreground">
            Instagram • LinkedIn • Facebook DMs
          </div>
        </div>
      )}

      {activeIndex === 1 && (
        <div className="my-auto space-y-2 py-1">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[8px] text-amber-600 dark:text-amber-400 font-bold">
              <span>RADAR MONITOR</span>
              <span className="animate-pulse">SWEEPING LIVE</span>
            </div>
            <div className="space-y-1.5 text-[8px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Competitor Share of Voice:</span>
                <span className="text-emerald-500 font-bold">+24% Ahead</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand Sentiment Score:</span>
                <span className="text-emerald-500 font-bold">96% Positive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monitored Networks:</span>
                <span className="text-primary font-bold">X, Reddit, LinkedIn</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeIndex === 2 && (
        <div className="my-auto space-y-2 py-1">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">
              PREDICTIVE ATTRIBUTION ROI
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-foreground font-mono">$18,450</span>
              <span className="text-[8px] font-bold text-emerald-500">+340% ROI</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-4/5" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/15 text-[8px] font-bold">
        <span>CONVERSATION & RADAR TELEMETRY</span>
        <span className="text-emerald-500 font-mono">ACTIVE</span>
      </div>
    </div>
  );
}

// ============================================================================
// Mockup 3: Brand Voice Guardian, Arena & Webhooks
// ============================================================================
function GuardianArenaMockup({ activeIndex }: { activeIndex: number }) {
  const complianceTiles = [
    { label: "READABILITY", score: "94/100" },
    { label: "FORBIDDEN_WORDS", score: "0 DETECTED" },
    { label: "CHAR_LIMITS", score: "OPTIMAL" },
    { label: "HMAC_GATEWAY", score: "200 OK" },
  ];

  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground/80 tracking-[0.15em] font-black text-[9px] sm:text-[10px]">
            {activeIndex === 0
              ? "BRAND_VOICE_LINTER"
              : activeIndex === 1
              ? "MULTI_MODEL_ARENA"
              : "WEBHOOKS_GATEWAY_HMAC"}
          </span>
        </div>
        <span className="text-[8px] text-primary font-bold">VERIFIED</span>
      </div>

      {activeIndex === 0 && (
        <div className="my-auto py-1">
          <div className="grid grid-cols-2 gap-2">
            {complianceTiles.map((tile, i) => (
              <div
                key={tile.label}
                className="bg-card border border-border/80 rounded-lg p-2 flex flex-col justify-between h-14 relative overflow-hidden"
              >
                <span className="text-[7px] text-muted-foreground font-bold">{tile.label}</span>
                <span className="text-[8px] text-emerald-500 font-bold">{tile.score}</span>
                <div className="w-full h-0.5 bg-primary/20 rounded-full overflow-hidden mt-1">
                  <motion.div
                    animate={{ x: [-30, 80] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    className="w-4 h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeIndex === 1 && (
        <div className="my-auto space-y-2 py-1">
          {[
            { model: "Claude 3.5 Sonnet", latency: "240ms", cost: "$0.003", winner: true },
            { model: "GPT-4o", latency: "290ms", cost: "$0.005", winner: false },
            { model: "DeepSeek-R1", latency: "380ms", cost: "$0.001", winner: false },
          ].map((m) => (
            <div
              key={m.model}
              className={`p-2 rounded-lg border flex items-center justify-between text-[8px] ${
                m.winner
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-card border-border/80 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <Swords className="w-3 h-3" />
                <span>{m.model}</span>
                {m.winner && <span className="text-[7px] bg-primary text-primary-foreground px-1.5 rounded">FASTEST</span>}
              </div>
              <div className="flex gap-2 font-mono">
                <span>{m.latency}</span>
                <span className="opacity-60">{m.cost}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeIndex === 2 && (
        <div className="my-auto space-y-2 py-1">
          <div className="p-3 bg-card border border-border/80 rounded-xl space-y-1.5 text-[8px]">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold">
              <span>HMAC SHA-256 SIGNATURE</span>
              <span>whsec_live_94a2...</span>
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Zapier Integration:</span>
                <span className="text-emerald-500 font-bold">200 Delivered</span>
              </div>
              <div className="flex justify-between">
                <span>Make.com Webhook:</span>
                <span className="text-emerald-500 font-bold">200 Delivered</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Retry Policy:</span>
                <span className="text-primary font-bold">Exponential Backoff</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/15 text-[8px] font-bold">
        <span>SECURITY & COMPLIANCE GATEWAY</span>
        <span className="text-emerald-500 font-mono">VERIFIED</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN FEATURES COMPONENT WITH GSAP/FRAMER-MOTION SCROLL-DRIVEN STACKING
// ============================================================================
export default function Features({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active feature selection per suite (suite 0, 1, 2)
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<number[]>([0, 0, 0]);

  const handleSelectFeature = (suiteIdx: number, featureIdx: number) => {
    setSelectedFeatureIndices((prev) => {
      const copy = [...prev];
      copy[suiteIdx] = featureIdx;
      return copy;
    });
  };

  // Track scroll through the tall multi-screen container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);

  // Update active pill indicator based on scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.35) {
      setActiveStep(0);
    } else if (latest < 0.7) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  // Card Transforms for the 1-by-1 Scroll Stacking
  const scale0 = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [1, 0.94, 0.88, 0.84]);
  const y0 = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, -12, -24, -30]);
  const opacity0 = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [1, 0.85, 0.4, 0.2]);

  const y1 = useTransform(scrollYProgress, [0.15, 0.45, 0.7, 1], ["100vh", "0vh", "-12px", "-20px"]);
  const scale1 = useTransform(scrollYProgress, [0.45, 0.7, 1], [1, 0.95, 0.9]);
  const opacity1 = useTransform(scrollYProgress, [0.15, 0.25, 0.75, 1], [0, 1, 0.85, 0.5]);

  const y2 = useTransform(scrollYProgress, [0.5, 0.8], ["100vh", "0vh"]);
  const scale2 = useTransform(scrollYProgress, [0.8, 1], [1, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.5, 0.6, 1], [0, 1, 1]);

  const cardTransforms = [
    { y: y0, scale: scale0, opacity: opacity0, zIndex: 10 },
    { y: y1, scale: scale1, opacity: opacity1, zIndex: 20 },
    { y: y2, scale: scale2, opacity: opacity2, zIndex: 30 },
  ];

  return (
    <section
      id="features"
      ref={containerRef}
      className={"relative h-[320vh] bg-background text-foreground transition-colors duration-300 " + (className || "")}
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6">
        {/* Ambient Blur Orbs */}
        <div className="absolute top-[20%] right-0 w-[550px] h-[550px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-[20%] -left-1/4 w-[550px] h-[550px] bg-accent/8 dark:bg-accent/4 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-3 sm:mb-5 shrink-0 z-40 max-w-2xl px-2">
          <div className="inline-flex items-center justify-center gap-2.5 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary font-mono">02.</span>
            <div className="w-4 h-[1px] bg-primary/40" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary font-mono">
              Core Platform Features
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-tight">
            Autonomous AI Engine.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Compounding Organic Dominance.
            </span>
          </h2>
        </div>

        {/* The Card Stack Arena: exact fixed bounds so cards layer on top of each other */}
        <div className="relative w-full max-w-6xl h-[530px] sm:h-[490px] md:h-[510px] lg:h-[520px]">
          {cardSuites.map((suite, suiteIdx) => {
            const activeFeatureIdx = selectedFeatureIndices[suiteIdx] || 0;
            const currentFeature = suite.features[activeFeatureIdx];
            const isOdd = suiteIdx % 2 !== 0;
            const { y, scale, opacity, zIndex } = cardTransforms[suiteIdx];

            return (
              <motion.div
                key={suite.suiteNumber}
                style={{
                  y,
                  scale,
                  opacity,
                  zIndex,
                }}
                className="absolute inset-0 w-full h-full will-change-transform"
              >
                <div className="relative w-full h-full overflow-hidden rounded-[28px] sm:rounded-[36px] md:rounded-[40px] bg-card text-card-foreground border border-border/80 shadow-2xl dark:shadow-[0_-25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between group">
                  {/* Subtle Grid Pattern Overlay */}
                  <div
                    className="absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] bg-[size:32px_32px] pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(169,84,247,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(169,84,247,0.08) 1px, transparent 1px)",
                    }}
                  />

                  {/* Corner Accent Brackets */}
                  <div className="absolute top-6 left-6 w-7 h-7 border-t-2 border-l-2 border-primary/30 dark:border-primary/20 rounded-tl-lg pointer-events-none" />
                  <div className="absolute bottom-6 right-6 w-7 h-7 border-b-2 border-r-2 border-primary/30 dark:border-primary/20 rounded-br-lg pointer-events-none" />

                  {/* Top Node Tab */}
                  <div className="absolute top-0 right-8 sm:right-12 px-5 py-1.5 bg-primary/10 border-x border-b border-border/60 rounded-b-xl flex items-center gap-2 z-20">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    </div>
                    <span className="text-[8px] font-black text-primary tracking-[0.2em] uppercase font-mono">
                      {"SUITE_NODE_" + suite.suiteNumber}
                    </span>
                  </div>

                  {/* Body Content Grid */}
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 items-center my-auto">
                    {/* Text Column with Feature Pills Switcher */}
                    <div className={"flex flex-col " + (isOdd ? "lg:order-2" : "")}>
                      {/* 3 Interactive Feature Pills from this Suite */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suite.features.map((feat, fIdx) => (
                          <button
                            key={feat.title}
                            onClick={() => handleSelectFeature(suiteIdx, fIdx)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold transition-all cursor-pointer ${
                              activeFeatureIdx === fIdx
                                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(169,84,247,0.4)] scale-105"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/60"
                            }`}
                          >
                            {feat.icon}
                            <span>{feat.badge}</span>
                          </button>
                        ))}
                      </div>

                      {/* Main Title & Description Animated on Switch */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentFeature.title}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="inline-flex items-center gap-3.5 mb-2 sm:mb-3">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center shadow-xs">
                              {currentFeature.icon}
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                              {currentFeature.badge}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight mb-2 sm:mb-3 leading-tight">
                            {currentFeature.title}
                          </h3>

                          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-lg font-medium">
                            {currentFeature.description}
                          </p>
                        </motion.div>
                      </AnimatePresence>

                      <motion.button
                        whileHover={{ scale: 1.04, x: 4 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-3.5 text-primary-foreground font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full w-fit transition-colors shadow-[0_10px_30px_rgba(168,85,247,0.3)] group/btn cursor-pointer"
                      >
                        <span>Explore {currentFeature.badge}</span>
                        <div className="w-5 h-5 rounded-full bg-primary-foreground text-primary flex items-center justify-center -mr-1 group-hover/btn:translate-x-1 transition-transform shadow-xs">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </motion.button>
                    </div>

                    {/* Mockup Column */}
                    <div className={"relative " + (isOdd ? "lg:order-1" : "")}>
                      <div className="relative w-full h-[220px] sm:h-[250px] md:h-[280px] lg:h-[310px] bg-muted/40 dark:bg-card/80 rounded-[24px] sm:rounded-[28px] border border-border/80 p-2.5 shadow-xl overflow-hidden">
                        {/* Scanning Sweep */}
                        <motion.div
                          animate={{ y: [-400, 400] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/0 via-primary/10 to-transparent z-20 pointer-events-none"
                        />
                        <div className="w-full h-full bg-card dark:bg-background/90 rounded-[20px] border border-border/60 overflow-hidden relative shadow-inner">
                          {suiteIdx === 0 && <CarouselStudioMockup activeIndex={activeFeatureIdx} />}
                          {suiteIdx === 1 && <LeadBotMockup activeIndex={activeFeatureIdx} />}
                          {suiteIdx === 2 && <GuardianArenaMockup activeIndex={activeFeatureIdx} />}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.04)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Telemetry Bar */}
                  <div className="border-t border-border/60 pt-3 flex justify-between items-center text-[8px] font-mono text-muted-foreground">
                    <div className="flex gap-6">
                      <div>
                        SUITE: <span className="font-bold text-foreground">{suite.suiteBadge}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        STATUS: <span className="font-bold text-emerald-500">READY</span>
                      </div>
                    </div>
                    <div className="tracking-wider text-muted-foreground/80">© SOCIAL_AI_PROTOCOL_02</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll Progress Step Indicators */}
        <div className="flex items-center gap-4 mt-3 sm:mt-5 z-40">
          {cardSuites.map((suite, idx) => (
            <div
              key={suite.suiteNumber}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeStep === idx
                    ? "w-8 sm:w-12 bg-primary shadow-[0_0_12px_rgba(169,84,247,0.5)]"
                    : "w-2.5 bg-muted-foreground/30"
                }`}
              />
              <span
                className={`text-[9px] font-mono font-bold transition-colors ${
                  activeStep === idx ? "text-primary" : "text-muted-foreground"
                }`}
              >
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
