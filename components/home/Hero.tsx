"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Send, TrendingUp, Users, Calendar } from "lucide-react";
import React from "react";
import Link from "next/link";
import TextType from "../TextType";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden bg-background border-b border-border">
      <div className="container mx-auto px-4 text-center max-w-5xl">
        {/* Announcement Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border mb-6">
          <span className="flex h-1.5 w-1.5 bg-primary" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
            SYSTEM ENGINE V2.0 // AUTONOMOUS SOCIAL DISPATCH
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-mono font-black uppercase tracking-tight text-foreground mb-4">
          SCALE YOUR <span className="text-primary">ORGANIC REACH</span> WITH AUTONOMOUS AI
        </h1>

        {/* Subheader */}
        <p className="text-xs md:text-sm font-mono text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          High-performance multi-agent orchestration for continuous content generation, multi-platform publishing, and CRM revenue attribution.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 max-w-md mx-auto">
          <Link href="/register" className="w-full sm:w-auto flex-1">
            <Button size="lg" className="w-full">
              INITIALIZE 14-DAY TRIAL
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto flex-1">
            <Button variant="outline" size="lg" className="w-full">
              VIEW FLEET TIERS
            </Button>
          </Link>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground mb-12 flex items-center justify-center gap-4">
          <span>✓ NO CREDIT CARD REQUIRED</span>
          <span className="text-primary">•</span>
          <span>✓ FULL MULTI-AGENT PIPELINE</span>
          <span className="text-primary">•</span>
          <TextType text={["10X GENERATION VELOCITY", "INSTANT REVENUE TRACKING", "CROSS-NETWORK PUBLISHING"]} className="text-[11px] font-mono text-primary font-bold" />
        </div>

        {/* Tactical Command Product Mockup */}
        <div className="relative mx-auto max-w-5xl border border-border bg-card shadow-none text-left">
          {/* Mockup Header */}
          <div className="h-9 border-b border-border bg-secondary/80 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">
                CONSOLE // LIVE TELEMETRY
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">STATUS: ALL AGENTS OPERATIONAL</span>
          </div>

          {/* Mockup Content Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sidebar Telemetry */}
            <div className="md:col-span-3 space-y-2 border-r border-border pr-2">
              <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground pb-1 border-b border-border">
                QUEUED VECTORS
              </div>
              {["X (Twitter) Feed", "LinkedIn Pulse", "Instagram Reel", "YouTube Short"].map((network, idx) => (
                <div key={network} className="h-8 bg-secondary/40 border border-border flex items-center justify-between px-2 text-xs font-mono">
                  <span className="text-foreground text-[11px]">{network}</span>
                  <span className="text-[10px] font-bold text-primary font-mono">READY</span>
                </div>
              ))}
            </div>

            {/* Central Dispatch */}
            <div className="md:col-span-6 space-y-3">
              <div className="p-4 border border-border bg-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono font-bold uppercase text-foreground">
                    AUTONOMOUS GENERATOR // LINKEDIN
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground italic mb-3">
                  "Synthesizing Q3 benchmark dataset for B2B pipeline conversion..."
                </p>
                <div className="w-full bg-background border border-border h-1.5">
                  <div className="bg-primary h-full w-3/4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-border bg-secondary/20">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-mono font-bold mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>GROWTH RATE</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-foreground">+142.8%</div>
                </div>
                <div className="p-3 border border-border bg-secondary/20">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-mono font-bold mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>AUDIENCE</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-foreground">28,490</div>
                </div>
              </div>
            </div>

            {/* Scheduled Queue */}
            <div className="md:col-span-3 space-y-2 border-l border-border pl-2">
              <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground pb-1 border-b border-border flex items-center justify-between">
                <span>TIMELINE</span>
                <Calendar className="w-3 h-3 text-primary" />
              </div>
              {[
                { time: "14:00 UTC", target: "X / Thought Leadership" },
                { time: "17:30 UTC", target: "LI / Case Study" },
                { time: "21:00 UTC", target: "IG / Product Drop" },
              ].map((item, idx) => (
                <div key={idx} className="p-2 border border-border bg-secondary/30 text-[11px] font-mono">
                  <div className="text-primary font-bold">{item.time}</div>
                  <div className="text-muted-foreground truncate">{item.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
