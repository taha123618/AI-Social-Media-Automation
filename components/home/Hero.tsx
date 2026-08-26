"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { ChevronRight, Sparkles, Send, TrendingUp, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import TextType from "../TextType";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-background">
      {/* Mesh Gradient Ambient Backdrop */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-80" />

      <div className="container mx-auto px-4 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Announcement Pill */}
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-8 shadow-xs backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-tight">
              V2.0 is live: Multi-channel AI Scheduling
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-primary" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeIn}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.08]"
          >
            Autonomous Social Automation <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Engineered for Scale
            </span>
          </motion.h1>

          {/* Subheader */}
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Deploy 13 autonomous AI agents that analyze trends, research high-ranking content, and publish multi-channel campaigns seamlessly.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 max-w-md mx-auto relative z-20"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold px-8 h-12 rounded-xl shadow-lg shadow-primary/25">
                <span>Start 14-Day Fleet Trial</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talk-to-sales" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-medium px-6 h-12 rounded-xl">
                Book Architecture Demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust Value Props */}
          <motion.div
            variants={fadeIn}
            className="text-xs font-medium text-muted-foreground mb-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              14-Day Free Trial
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Zero Credit Card Required
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <TextType
              text={["10x Higher Velocity", "Deterministic RAG Safety", "Gutenberg + CMS Ingestion"]}
              className="text-xs font-medium text-foreground"
            />
          </motion.div>

          {/* Product Preview Card */}
          <motion.div
            variants={fadeIn}
            className="relative mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card/90 shadow-2xl overflow-hidden aspect-[16/10] group"
          >
            {/* Top Toolbar */}
            <div className="h-11 border-b border-border/70 bg-muted/40 flex items-center px-5 justify-between">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="text-xs font-mono font-medium text-muted-foreground px-3 py-1 bg-background/60 rounded-md border border-border/50">
                app.socialai.internal/workspace/fleet
              </div>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                AI
              </div>
            </div>

            {/* Mockup Workspace */}
            <div className="p-6 grid grid-cols-12 gap-6 h-full text-left">
              {/* Mini Sidebar */}
              <div className="col-span-3 space-y-3">
                {[
                  { label: "Content Pipeline", active: true },
                  { label: "Analytics & ROI", active: false },
                  { label: "Mastra Swarm", active: false },
                  { label: "Brand Voice RAG", active: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`h-9 rounded-lg flex items-center px-3 gap-2.5 text-xs font-medium transition-colors ${item.active
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${item.active ? "bg-white" : "bg-muted-foreground/50"}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Feed & Generation Card */}
              <div className="col-span-6 space-y-4">
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Autonomous Multi-Agent Writer</h4>
                      <p className="text-[11px] text-primary font-medium">Synthesizing LinkedIn & X Carousel...</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "10%" }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border/80 text-xs text-foreground/80 leading-relaxed">
                    &ldquo;Scaling social presence requires continuous topical authority rather than manual intermittent posting. Here is our 4-layer framework...&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border/70 text-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                    <div className="text-xl font-mono font-bold text-foreground">+148.2%</div>
                    <div className="text-[10px] uppercase font-medium text-muted-foreground">Impression Velocity</div>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/70 text-center">
                    <Users className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <div className="text-xl font-mono font-bold text-foreground">24.8K</div>
                    <div className="text-[10px] uppercase font-medium text-muted-foreground">Audience Reached</div>
                  </div>
                </div>
              </div>

              {/* Scheduled Queue */}
              <div className="col-span-3 space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border/80 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold text-xs text-foreground">Dispatch Calendar</h5>
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { time: "09:00 AM", title: "Topical SEO Thread" },
                        { time: "01:30 PM", title: "Product Teardown Reel" },
                        { time: "05:00 PM", title: "Weekly Growth Insights" },
                      ].map((slot, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-left">
                          <div className="text-[10px] font-mono text-primary font-semibold">{slot.time}</div>
                          <div className="text-xs font-medium text-foreground truncate">{slot.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="w-full text-xs font-semibold h-8 rounded-lg mt-4">
                    DISPATCH QUEUE
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Dispatch Indicator */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-16 right-8 p-3 bg-card rounded-xl shadow-xl border border-border flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Mastra Dispatcher</div>
                <div className="text-xs font-semibold text-foreground">Scheduled 5 Channels</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Brand Logos Marquee */}
      <div className="mt-20 border-y border-border/60 py-8 bg-muted/20 overflow-hidden">
        <div className="container mx-auto px-4 mb-5 text-center">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            POWERING LEADING CREATORS &amp; HIGH-GROWTH SAAS BRANDS
          </p>
        </div>
        {/* Duplicate items for seamless loop */}
        <div className="flex animate-marquee whitespace-nowrap opacity-50 hover:opacity-70 transition-opacity">
          {["LINKEDIN", "X / TWITTER", "INSTAGRAM", "TIKTOK", "YOUTUBE", "WORDPRESS", "GHOST", "SHOPIFY", "WEBFLOW", "NOTION", "MEDIUM", "LINKEDIN", "X / TWITTER", "INSTAGRAM", "TIKTOK", "YOUTUBE", "WORDPRESS", "GHOST", "SHOPIFY", "WEBFLOW", "NOTION", "MEDIUM"].map((network, i) => (
            <div key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              {network}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
