"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Cpu, Target, FileText, CheckCircle, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AIBlogWriterMarketingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const mockupRef = useRef(null);

  useGSAP(() => {
    // Hero entrance animation
    const tl = gsap.timeline();
    tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".hero-title", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6")
      .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
      .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
      .from(".hero-mockup", { scale: 0.9, opacity: 0, duration: 1.2, ease: "expo.out" }, "-=0.5");

    // Float animation for elements
    gsap.to(".float-element", {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.3
    });

    // Scroll-based reveal for features
    gsap.utils.toArray(".feature-card").forEach((card: any) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  }, { scope: containerRef });

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <div ref={containerRef} className="relative isolate overflow-hidden bg-slate-950 text-slate-100 min-h-screen">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 backdrop-blur-md mb-8">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>The Enterprise Content Engine</span>
          </div>

          <h1 className="hero-title text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-[1.1]">
            AI Content That Actually <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Ranks on Search Engines
            </span>
          </h1>

          <p className="hero-desc mt-6 text-xl leading-8 text-slate-400 max-w-2xl mx-auto mb-10">
            Recreate the GravityWrite experience with enterprise-grade precision. Long-form articles, real-time SEO scoring, and human-like intelligence.
          </p>

          <div className="hero-ctas mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/blog"
              className="group relative flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-950 shadow-2xl hover:scale-[1.05] transition-all duration-300"
            >
              Start Generating Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="text-lg font-semibold leading-6 text-white hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              Watch Demo <Zap className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup with Motion */}
        <motion.div 
          ref={mockupRef}
          style={{ scale, y }}
          className="hero-mockup mt-20 relative mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)]"
        >
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden aspect-[16/9]">
             {/* Mock UI Elements */}
             <div className="absolute inset-0 p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-24 rounded-lg bg-white/5" />
                    <div className="h-8 w-32 rounded-lg bg-blue-600/20 border border-blue-500/30" />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-8 h-full">
                  <div className="col-span-8 space-y-4">
                    <div className="h-10 w-3/4 rounded-lg bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-white/5" />
                      <div className="h-4 w-full rounded-md bg-white/5" />
                      <div className="h-4 w-5/6 rounded-md bg-white/5" />
                      <div className="h-4 w-full rounded-md bg-white/5" />
                    </div>
                  </div>
                  <div className="col-span-4 space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">SEO Score</span>
                          <span className="text-emerald-400 font-bold">92/100</span>
                       </div>
                       <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-500" 
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 2, delay: 1 }}
                          />
                       </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                       <div className="h-4 w-2/3 rounded bg-white/10" />
                       <div className="h-3 w-full rounded bg-white/5" />
                       <div className="h-3 w-full rounded bg-white/5" />
                    </div>
                  </div>
                </div>
             </div>

             {/* Floating Elements */}
             <motion.div 
                className="float-element absolute -top-10 -right-10 p-6 rounded-2xl bg-blue-600 shadow-2xl shadow-blue-500/40"
             >
                <Cpu className="h-8 w-8 text-white" />
             </motion.div>
             <motion.div 
                className="float-element absolute -bottom-8 -left-8 p-6 rounded-2xl bg-violet-600 shadow-2xl shadow-violet-500/40"
             >
                <Target className="h-8 w-8 text-white" />
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to dominate SERPs</h2>
          <p className="mt-4 text-lg text-slate-400">Enterprise features that GravityWrite users only dream of.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FeatureCard 
              icon={<Sparkles className="h-6 w-6 text-blue-400" />}
              title="Semantic Optimization"
              description="Our AI doesn't just use keywords; it understands search intent and semantic relationships."
           />
           <FeatureCard 
              icon={<Shield className="h-6 w-6 text-emerald-400" />}
              title="Humanized Output"
              description="Proprietary models that bypass AI detectors while maintaining high factual accuracy."
           />
           <FeatureCard 
              icon={<FileText className="h-6 w-6 text-violet-400" />}
              title="Long-Form Engine"
              description="Generate 2,500+ word deep-dives that provide actual value to your readers."
           />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="feature-card group relative p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-3 rounded-2xl bg-slate-900 border border-white/10 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
