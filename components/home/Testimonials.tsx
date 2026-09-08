/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Star,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Review {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  initials: string;
}

const reviews: Review[] = [
  {
    name: "Alex Rivera",
    role: "Founder, Bloom Digital Fleet",
    quote:
      "SocialAI reduced our organic production time by 80%. We manage 2x client rosters with deterministic tone safety and zero burnout.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    initials: "AR",
  },
  {
    name: "Sarah Chen",
    role: "E-comm Growth Operator",
    quote:
      "The multi-agent workflow is astonishing. Our topical authority rankings and buyer engagement rose significantly in under 3 weeks.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    initials: "SC",
  },
  {
    name: "Marcus Thorne",
    role: "VP Marketing, TechFlow Cloud",
    quote:
      "Brand safety was our biggest concern with AI generation. SocialAI's pgvector guardrails and style linters are unmatched in precision.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    initials: "MT",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Content Ops",
    quote:
      "Finally, an autonomous engine that genuinely replicates our brand voice across 5 platforms without generic LLM platitudes.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    initials: "ER",
  },
  {
    name: "David Park",
    role: "Principal Growth Engineer",
    quote:
      "The analytics attribution breakdowns are comprehensive. We can pinpoint conversion ROI for every article and social carousel vector.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    initials: "DP",
  },
  {
    name: "Maya Lin",
    role: "Director of Demand Gen, Apex",
    quote:
      "Automating multi-channel distribution across LinkedIn, X, and Instagram took our team from chaotic deadlines to breaking quarterly records.",
    avatar: "https://images.unsplash.com/photo-1534751516642-a1714f5a5467?auto=format&fit=crop&q=80&w=200",
    initials: "ML",
  },
];

// Doubled review array [0..5, 0..5] for seamless 50% infinite translation loop
const marqueeReviews = [...reviews, ...reviews];

const stats = [
  { value: "25K+", label: "Active Workspaces" },
  { value: "148M+", label: "Posts Dispatched" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.8×", label: "Avg. ROAS Uplift" },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full bg-background py-20 md:py-32 px-4 sm:px-8 md:px-12 lg:px-16 relative overflow-hidden selection:bg-primary selection:text-white"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[300px] bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Inline keyframes for seamless vertical marquee */}
      <style>{`
        @keyframes marquee-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 1. Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            {/* Section Tag Row */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              {/* Circular Badge with continuously rotating sparkles */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border/80 bg-card/80 backdrop-blur-md flex items-center justify-center shadow-xs overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-primary fill-primary/30" />
                </motion.div>
              </div>

              {/* Pill Badge */}
              <div className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-md flex items-center justify-center shadow-xs">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                  Verified Social Proof
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.15] sm:leading-[1.12] tracking-tight">
              What growth teams say
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
                about SocialAI fleets
              </span>
            </h2>
          </div>

          {/* Right Narrative Block */}
          <div className="max-w-xs md:text-right pb-2">
            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
              Every campaign orchestrated with our multi-agent engine is built
              on deterministic tone safety, verifiable RAG groundings, and
              measurable conversion ROI.
            </p>
          </div>
        </div>

        {/* 2. Three-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {/* Left Column — Stats / CTA Card */}
          <div className="flex flex-col bg-card/70 backdrop-blur-xl p-8 rounded-[32px] border border-border/80 hover:border-primary/40 transition-all duration-300 min-h-[480px] lg:h-[580px] shadow-sm relative overflow-hidden group">
            {/* Subtle radial ambient */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Rating Row */}
            <div className="flex items-start gap-3.5 mb-7">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground leading-none tracking-tight font-mono">
                  4.9
                </span>
                <span className="text-base text-muted-foreground font-normal">
                  /5
                </span>
              </div>
              <div className="pt-1.5 text-xs sm:text-[13px] text-muted-foreground leading-[1.35] font-medium">
                Based on{" "}
                <span className="font-bold text-foreground">
                  1,200+ verified
                </span>
                <br />
                agency &amp; enterprise reviews
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground/90 font-medium tracking-tight">
                  148M+ autonomous posts published
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground/90 font-medium tracking-tight">
                  100% tone safety with pgvector RAG
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground/90 font-medium tracking-tight">
                  4.8× average organic reach acceleration
                </span>
              </div>
            </div>

            {/* CTA Block */}
            <div className="mt-auto pt-6 border-t border-border/60">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-normal">
                Ready to scale your autonomous output?
              </p>
              <p className="text-base font-bold text-foreground mb-4 tracking-tight">
                Launch your 14-day free trial!
              </p>
              <div className="flex items-center gap-2.5 group/cta">
                <Link
                  href="/register"
                  className="px-6 py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-md shadow-primary/20 whitespace-nowrap cursor-pointer"
                >
                  Start Free Fleet
                </Link>
                <Link
                  href="/register"
                  aria-label="Start Free Fleet"
                  className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/20 group-hover/cta:translate-x-1 active:scale-95 cursor-pointer shrink-0"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Center Column — Case Study Hero Card with Gradient Quote Overlay */}
          <div className="flex min-h-[480px] lg:h-[580px]">
            <div className="relative w-full h-full rounded-[32px] overflow-hidden group shadow-md border border-border/80 flex bg-card">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200"
                alt="Growth team optimizing autonomous campaign workflows"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Tag pill at top of photo */}
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-xs font-semibold text-primary">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ENTERPRISE SPOTLIGHT
              </div>

              {/* Seamless gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

              {/* Caption Overlay */}
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-lg md:text-xl font-medium leading-[1.4] mb-3 text-white/95">
                  &ldquo;SocialAI eliminated 40+ hours of manual content
                  production every week while scaling our organic pipeline by
                  320%.&rdquo;
                </p>
                <p className="text-sm text-white/75 font-normal tracking-wide">
                  — Marcus Thorne, VP Marketing at TechFlow Cloud
                </p>
              </div>
            </div>
          </div>

          {/* Right Column — Infinite Vertical Marquee */}
          <div className="md:col-span-2 lg:col-span-1 min-h-[480px] lg:h-[580px] relative overflow-hidden rounded-[32px] border border-border/80 bg-card/40 backdrop-blur-md">
            <div
              className="flex flex-col gap-4 p-3"
              style={{ animation: "marquee-up 32s linear infinite" }}
            >
              {marqueeReviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-card/90 backdrop-blur-sm p-6 rounded-[24px] border border-border/80 hover:border-primary/40 shadow-xs flex flex-col shrink-0 transition-all duration-200"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed mb-4">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div className="mt-auto flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shadow-xs border border-border/80"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {review.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {review.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Stat Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="border-t border-border/60 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold text-foreground tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
