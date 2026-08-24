"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/use-parallax";
import TextType from "../../../../components/TextType";

const ANIMATED_WORDS = ["Ranks on Google", "Drives Traffic", "Converts Readers", "Builds Authority"];

export default function BlogHero() {
  const { ref: mockupRef, offsetY: mockupOffset } = useParallax(0.15);
  const { ref: bgGlowRef, offsetY: bgGlowOffset } = useParallax(-0.08);
  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden bg-background">
      {/* Ambient blobs */}
      <div ref={bgGlowRef} className="absolute inset-0 -z-10 pointer-events-none" style={{ transform: `translateY(${bgGlowOffset}px)` }}>
        <div className="absolute top-[-10%] left-[15%] w-150 h-150 rounded-full bg-primary/15 blur-[140px] animate-pulse dark:bg-primary/15" />
        <div
          className="absolute bottom-[-10%] right-[10%] w-125 h-125 rounded-full bg-primary/15 blur-[140px] animate-pulse dark:bg-primary/15"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 rounded-full bg-primary/5 blur-[120px] dark:bg-primary/5" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md mb-10"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Blog Writer — Now with Real-Time SEO Scoring</span>
            <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95] mb-8"
          >
            Write Content That{" "}
            <TextType
              text={ANIMATED_WORDS}
              typingSpeed={60}
              deletingSpeed={30}
              pauseDuration={2500}
              className="inline-block bg-linear-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent text-5xl sm:text-6xl lg:text-8xl font-black"
            />
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            From keyword to publish-ready article in minutes. AI-generated long-form blogs
            with built-in SEO intelligence, brand voice control, and human-like quality.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link href="/blog">
              <Button className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Start Writing Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-8 py-6 rounded-2xl text-lg font-bold backdrop-blur-sm flex items-center gap-2"
              >
                <Zap className="h-5 w-5 text-primary" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 font-semibold text-foreground">4.9/5 from 2,400+ users</span>
            </div>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>✓ 14-day free trial</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>✓ No credit card required</span>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          ref={mockupRef}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative mx-auto max-w-5xl"
          style={{ transform: `translateY(${mockupOffset}px)` }}
        >
          {/* Glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-primary/30 via-primary/20 to-primary/20 blur-2xl" />
          <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_-20px_rgba(59,130,246,0.4)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="h-7 w-64 rounded-full bg-muted border border-border flex items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">`${process.env.APP_URL}/blog/new-article`</span>
              </div>
              <div className="w-20 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">AI Active</span>
              </div>
            </div>

            {/* Content area */}
            <div className="grid grid-cols-12 gap-0 h-72">
              {/* Editor pane */}
              <div className="col-span-8 p-6 border-r border-border space-y-4">
                <div className="h-6 w-2/3 rounded-lg bg-muted" />
                <div className="space-y-2">
                  {[100, 95, 100, 88, 100, 72].map((w, i) => (
                    <motion.div
                      key={i}
                      className="h-3 rounded-md bg-muted/50"
                      style={{ width: `${w}%` }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-8 w-28 rounded-lg bg-primary/30 border border-primary/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">✓ Humanized</span>
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">SEO: 94/100</span>
                  </div>
                </div>
              </div>

              {/* SEO sidebar */}
              <div className="col-span-4 p-6 space-y-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">SEO Analysis</p>
                {[
                  { label: "Keyword Density", val: 92, color: "bg-emerald-500" },
                  { label: "Readability", val: 87, color: "bg-blue-500" },
                  { label: "Structure", val: 95, color: "bg-violet-500" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{label}</span>
                      <span className="font-bold text-foreground">{val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1.5, delay: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold">2,500 words in 45s</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-2"
          >
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-bold">Rank #1 on Google</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
