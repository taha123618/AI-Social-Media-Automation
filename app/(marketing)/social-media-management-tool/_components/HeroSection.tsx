"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, CheckCircle2, Sparkles, Clock, BarChart2, Share2 } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const platforms = [
  { icon: FaLinkedin, name: "LinkedIn", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-foreground", bg: "bg-foreground/10 border-foreground/20" },
  { icon: FaInstagram, name: "Instagram", color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  { icon: FaFacebook, name: "Facebook", color: "text-blue-600", bg: "bg-blue-600/10 border-blue-600/20" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 text-center overflow-hidden bg-background">
      {/* Ambient mesh background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Multi-Channel Social Fleet Automation v2.4</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
            Autonomous Social Fleet <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Scheduling &amp; Dispatch
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, calibrate, schedule, and analyze multi-channel campaigns across LinkedIn, X, Instagram, Facebook, and YouTube powered by autonomous AI swarms.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-center mb-10 max-w-md mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold px-7 h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-medium px-7 h-12 rounded-xl border-border/80 hover:bg-muted/50 transition-all">
                View Plan Matrix
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground mb-12">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Zero manual posting
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Optimal peak-time algorithms
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Live engagement telemetry
            </span>
          </div>

          {/* Platform chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {platforms.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${p.bg} border`}>
                    <Icon className={`w-3 h-3 ${p.color}`} />
                  </div>
                  <span>{p.name}</span>
                </div>
              );
            })}
          </div>

          {/* Autonomous Fleet Queue Live Preview Mockup Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mockup Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-foreground tracking-wide uppercase">
                  Autonomous Fleet Dispatch Queue
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
                  Live Swarm Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Next dispatch in 18 mins</span>
              </div>
            </div>

            {/* Queue Item Preview */}
            <div className="mt-6 space-y-4">
              <div className="p-4 sm:p-5 rounded-xl border border-border/70 bg-background/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Optimized for Peak Reach
                    </span>
                    <span className="text-xs text-muted-foreground">Target: 09:15 AM (EST)</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    &quot;10 Frameworks for Scaling Multi-Agent Systems in Enterprise SaaS without Operational Bloat 🚀&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Multi-variant calibration: LinkedIn (Formal), X (Thread hook), Instagram (Carousel caption).
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-500 text-xs">
                      <FaLinkedin className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-foreground text-xs">
                      <FaXTwitter className="w-3 h-3" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-500 text-xs">
                      <FaInstagram className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-foreground">98.4%</div>
                    <div className="text-[10px] text-muted-foreground">Resonance Score</div>
                  </div>
                </div>
              </div>

              {/* Mini Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border/50 bg-card/60">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <BarChart2 className="w-3 h-3 text-primary" />
                    Est. Impressions
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">38,400+</div>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-card/60">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-accent" />
                    Sync Status
                  </div>
                  <div className="text-sm font-bold text-emerald-500 mt-0.5">100% Synced</div>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-card/60">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="w-3 h-3 text-primary" />
                    Channels Armed
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">5 Networks</div>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-card/60">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-purple-400" />
                    Publish Delay
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">&lt; 150ms</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
