"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Calendar, Sparkles, Shield, Zap, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMousePosition } from "@/hooks/use-mouse-position";

const FLOATING_ELEMENTS = [
  { icon: Users, label: "24,700+ Users", x: "12%", y: "22%", delay: 0, color: "from-blue-500/20 to-violet-500/20" },
  { icon: Zap, label: "AI-Powered", x: "82%", y: "20%", delay: 0.5, color: "from-amber-500/20 to-orange-500/20" },
  { icon: Shield, label: "99.9% Uptime", x: "8%", y: "72%", delay: 1, color: "from-emerald-500/20 to-teal-500/20" },
  { icon: BarChart3, label: "10x avg. ROI", x: "85%", y: "75%", delay: 1.5, color: "from-purple-500/20 to-pink-500/20" },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePosition(heroRef);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!heroRef.current || !glowRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".hero-badge", { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
      .fromTo(".hero-title-line", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.4")
      .fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.6")
      .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
      .fromTo(".hero-social-proof", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.2");

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        if (mockupRef.current) {
          gsap.set(mockupRef.current, {
            y: self.progress * 80,
            opacity: 1 - self.progress * 0.5,
            scale: 1 - self.progress * 0.05,
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
    gsap.to(glowRef.current, {
      x: mousePos.normalizedX * 30,
      y: mousePos.normalizedY * 30,
      duration: 1.5,
      ease: "power2.out",
    });
  }, [mousePos]);

  return (
    <section ref={heroRef} className="relative isolate min-h-screen flex items-center overflow-hidden bg-background">
      <div
        ref={glowRef}
        className="absolute pointer-events-none -z-10"
        style={{ width: "600px", height: "600px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="absolute inset-0 -z-20 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {FLOATING_ELEMENTS.map((el) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={el.label}
            className="absolute hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background/80 backdrop-blur-xl shadow-lg"
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
            <div className={`w-8 h-8 rounded-sm bg-gradient-to-br ${el.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-foreground">{el.label}</span>
          </motion.div>
        );
      })}

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md mb-10"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Schedule a Demo — See SocialAI in Action</span>
            <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </motion.div>

          <h1 className="hero-title">
            <span className="hero-title-line block text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95] mb-2">
              See Why Teams
            </span>
            <span className="hero-title-line block text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Choose SocialAI
              </span>
            </span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium mt-8">
            Book a personalized walkthrough with our product experts. See how SocialAI helps
            teams create, schedule, and analyze content at scale — with AI-powered automation.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="#demo-form">
              <Button className="group bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-[40px] text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Book Your Demo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground h-14 px-8 rounded-[40px] text-lg font-bold backdrop-blur-sm flex items-center gap-2"
              >
                <Zap className="h-5 w-5 text-primary" />
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="hero-social-proof flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 font-semibold text-foreground">4.9/5 from 2,400+ reviews</span>
            </div>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>No commitment required</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <span>30-minute session</span>
          </div>
        </div>

        <motion.div
          ref={mockupRef}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative mx-auto max-w-5xl"
        >
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/20 blur-2xl" />
          <div className="relative rounded-xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_-20px_rgba(59,130,246,0.4)]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card">
              <div className="flex gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="hidden sm:flex h-7 w-64 rounded-full bg-muted border border-border items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground truncate">/dashboard/analytics</span>
              </div>
              <div className="w-16 sm:w-20 h-6 sm:h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-bold text-primary">Live Demo</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 min-h-[220px] sm:h-80">
              <div className="col-span-8 p-4 sm:p-6 border-r border-border space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 sm:h-6 w-32 rounded-md bg-muted" />
                  <div className="h-5 sm:h-6 w-20 rounded-md bg-primary/20" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Posts Scheduled", value: "847", change: "+12%", color: "text-emerald-400" },
                    { label: "Engagement Rate", value: "4.8%", change: "+0.6%", color: "text-emerald-400" },
                    { label: "Audience Growth", value: "12.3K", change: "+8.2%", color: "text-emerald-400" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="p-3 sm:p-4 rounded-md bg-muted/50 border border-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-base sm:text-xl font-black text-foreground">{stat.value}</p>
                      <p className={`text-[10px] sm:text-xs font-bold ${stat.color}`}>{stat.change}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="h-8 sm:h-10 rounded-md bg-muted/30 border border-border flex items-center px-3 sm:px-4 gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/40 border-2 border-card" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">3 posts publishing this hour</span>
                </div>
              </div>

              <div className="col-span-4 p-3 sm:p-6 space-y-3 sm:space-y-5">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Platform Performance
                </p>
                {[
                  { platform: "Instagram", val: 92, color: "bg-pink-500" },
                  { platform: "LinkedIn", val: 78, color: "bg-blue-500" },
                  { platform: "Twitter", val: 85, color: "bg-sky-500" },
                ].map(({ platform, val, color }) => (
                  <div key={platform} className="space-y-1">
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>{platform}</span>
                      <span className="font-bold text-foreground">{val}%</span>
                    </div>
                    <div className="h-1 sm:h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1.5, delay: 1.3 }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">AI Score</p>
                  <p className="text-lg sm:text-2xl font-black text-foreground">94<span className="text-sm text-muted-foreground">/100</span></p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-md shadow-2xl shadow-primary/40 flex items-center gap-1.5 sm:gap-2"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold">24,700+ users</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-md shadow-2xl shadow-primary/40 flex items-center gap-1.5 sm:gap-2"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold">10x avg. ROI</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
