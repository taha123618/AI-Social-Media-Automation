"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { ArrowRight, Sparkles, Zap, Brain, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TextType";

const WORDS = ["Ranks on Google", "Drives Organic Traffic", "Converts Inbound Leads", "Builds Topical Authority"];

const FLOATING_ELEMENTS = [
  { icon: Brain, label: "AI Swarm Active", x: "12%", y: "18%", delay: 0 },
  { icon: Shield, label: "pgvector Grounded", x: "82%", y: "22%", delay: 0.5 },
  { icon: TrendingUp, label: "Gutenberg HTML", x: "10%", y: "72%", delay: 1 },
  { icon: Zap, label: "1-Click CMS Export", x: "85%", y: "70%", delay: 1.5 },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!heroRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      ".hero-badge",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
      .fromTo(
        ".hero-title-line",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        "-=0.3"
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.4"
      )
      .fromTo(
        ".hero-cta",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2"
      );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative isolate min-h-[90vh] flex items-center overflow-hidden bg-background pt-28 pb-20"
    >
      {/* Ambient mesh background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-70" />

      {/* Floating telemetry pills */}
      {FLOATING_ELEMENTS.map((el) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={el.label}
            className="absolute hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-md shadow-xs text-xs font-semibold text-foreground"
            style={{ left: el.x, top: el.y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{
              duration: 4,
              delay: el.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Icon className="w-3 h-3" />
            </div>
            <span>{el.label}</span>
          </motion.div>
        );
      })}

      <div className="mx-auto max-w-6xl px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Autonomous Multi-Agent Writer & SEO Engine</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] sm:leading-[1.08] mb-6">
            <span className="hero-title-line block">
              Generate Long-Form Articles That
            </span>
            <span className="hero-title-line block">
              <TextType
                text={WORDS}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={2500}
                className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-base sm:text-lg text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            Produce 2,500–8,000 word pillar articles with real-time SEO scoring, Gutenberg block serialization, and direct CMS publishing in under 3 minutes.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 max-w-md mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold px-6 h-11 rounded-lg shadow-md shadow-primary/20">
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-medium px-6 h-11 rounded-lg">
                View Plan Quotas
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              100-Point SEO Scorer
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              WordPress, Ghost & Webflow Export
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              pgvector Brand Voice
            </span>
          </div>
        </div>

        {/* Live Mockup Preview Card */}
        <div
          ref={mockupRef}
          className="mt-16 relative mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden text-left"
        >
          <div className="h-10 border-b border-border/70 bg-muted/40 flex items-center px-4 justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="font-mono text-muted-foreground text-[11px]">
              Gutenberg Block Editor • 98% SEO Score
            </div>
            <div className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              LIVE PREVIEW
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs font-mono text-primary font-semibold">
                # Autonomous AI Inbound Marketing: The 2026 Framework
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional content production cycles suffer from high operational latency. By pairing autonomous research swarms with deterministic RAG retrieval, growth fleets publish pillar content at 10x velocity.
              </p>
              <pre className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-xs font-mono text-foreground whitespace-pre-wrap">
                {`<!-- wp:heading {"level":2} -->
<h2>Core Ingestion & Serialization Flow</h2>
<!-- /wp:heading -->`}
              </pre>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-5">
              <div className="text-xs font-bold text-foreground">Live Telemetry</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Word Count:</span>
                  <span className="font-bold text-foreground">3,842 words</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reading Time:</span>
                  <span className="font-bold text-foreground">16 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Density:</span>
                  <span className="font-bold text-primary">1.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SEO Grade:</span>
                  <span className="font-bold text-emerald-500">A+ (98/100)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
