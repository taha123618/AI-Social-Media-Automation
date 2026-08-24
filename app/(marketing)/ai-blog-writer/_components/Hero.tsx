"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles, Zap, Star, Brain, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TextType";
import { useMousePosition } from "@/hooks/use-mouse-position";

const WORDS = ["Ranks on Google", "Drives Traffic", "Converts Readers", "Builds Authority"];

const FLOATING_ELEMENTS = [
  { icon: Brain, label: "AI-Powered", x: "15%", y: "20%", delay: 0, color: "from-blue-500/20 to-violet-500/20" },
  { icon: Shield, label: "99.9% Uptime", x: "80%", y: "25%", delay: 0.5, color: "from-emerald-500/20 to-teal-500/20" },
  { icon: TrendingUp, label: "SEO Optimized", x: "10%", y: "70%", delay: 1, color: "from-amber-500/20 to-orange-500/20" },
  { icon: Zap, label: "Lightning Fast", x: "85%", y: "75%", delay: 1.5, color: "from-purple-500/20 to-pink-500/20" },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePosition(heroRef);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!heroRef.current || !glowRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      ".hero-badge",
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
    )
      .fromTo(
        ".hero-title-line",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
        "-=0.4",
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.6",
      )
      .fromTo(
        ".hero-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3",
      )
      .fromTo(
        ".hero-social-proof",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.2",
      );

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        if (mockupRef.current) {
          const progress = self.progress;
          gsap.set(mockupRef.current, {
            y: progress * 80,
            opacity: 1 - progress * 0.5,
            scale: 1 - progress * 0.05,
          });
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  useEffect(() => {
    if (!glowRef.current) return;
    const x = mousePos.normalizedX * 30;
    const y = mousePos.normalizedY * 30;
    gsap.to(glowRef.current, {
      x,
      y,
      duration: 1.5,
      ease: "power2.out",
    });
  }, [mousePos]);

  return (
    <section
      ref={heroRef}
      className="relative isolate min-h-screen flex items-center overflow-hidden bg-background"
    >
      {/* Mouse-follow gradient glow */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none -z-10"
        style={{
          width: "600px",
          height: "600px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating elements */}
      {FLOATING_ELEMENTS.map((el) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={el.label}
            className="absolute hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-lg"
            style={{ left: el.x, top: el.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              duration: 4,
              delay: el.delay,
              repeat: Infinity,
              ease: "easeInOut",
              opacity: { duration: 1, delay: el.delay + 0.5 },
              scale: { duration: 0.5, delay: el.delay + 0.5 },
            }}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${el.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-foreground">{el.label}</span>
          </motion.div>
        );
      })}

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md mb-10"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Blog Writer — Real-Time SEO Scoring</span>
            <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </motion.div>

          {/* Headline */}
          <h1 className="hero-title">
            <span className="hero-title-line block text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95] mb-2">
              Write Content That
            </span>
            <span className="hero-title-line block text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter">
              <TextType
                text={WORDS}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={2500}
                className="inline-block bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent"
              />
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium mt-8">
            From keyword to publish-ready article in minutes. AI-generated long-form blogs
            with built-in SEO intelligence, brand voice control, and human-like quality.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
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
          </div>

          {/* Social proof */}
          <div className="hero-social-proof flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 font-semibold text-foreground">4.9/5 from 2,400+ users</span>
            </div>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>14-day free trial</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>No credit card required</span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          ref={mockupRef}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative mx-auto max-w-5xl"
        >
          {/* Glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/20 blur-2xl" />
          <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_-20px_rgba(59,130,246,0.4)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card">
              <div className="flex gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="hidden sm:flex h-7 w-64 rounded-full bg-muted border border-border items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground truncate">/blog/new-article</span>
              </div>
              <div className="w-16 sm:w-20 h-6 sm:h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-bold text-primary">AI Active</span>
              </div>
            </div>

            {/* Content area */}
            <div className="grid grid-cols-12 gap-0 min-h-[200px] sm:h-72">
              {/* Editor pane */}
              <div className="col-span-8 p-4 sm:p-6 border-r border-border space-y-3 sm:space-y-4">
                <div className="h-5 sm:h-6 w-2/3 rounded-lg bg-muted" />
                <div className="space-y-1.5 sm:space-y-2">
                  {[100, 95, 100, 88, 100, 72].map((w, i) => (
                    <motion.div
                      key={i}
                      className="h-2 sm:h-3 rounded-md bg-muted/50"
                      style={{ width: `${w}%` }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg bg-primary/30 border border-primary/30 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold text-primary">Humanized</span>
                  </div>
                  <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold text-primary">SEO: 94/100</span>
                  </div>
                </div>
              </div>

              {/* SEO sidebar */}
              <div className="col-span-4 p-3 sm:p-6 space-y-3 sm:space-y-5">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">SEO Analysis</p>
                {[
                  { label: "Keyword Density", val: 92, color: "bg-emerald-500" },
                  { label: "Readability", val: 87, color: "bg-blue-500" },
                  { label: "Structure", val: 95, color: "bg-violet-500" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>{label}</span>
                      <span className="font-bold text-foreground">{val}%</span>
                    </div>
                    <div className="h-1 sm:h-1.5 rounded-full bg-muted overflow-hidden">
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
            className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-1.5 sm:gap-2"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold">2,500 words in 45s</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-1.5 sm:gap-2"
          >
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            <span className="text-xs sm:text-sm font-bold">Rank #1 on Google</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
