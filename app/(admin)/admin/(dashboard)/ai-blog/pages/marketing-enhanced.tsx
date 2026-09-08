"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Cpu, Target, FileText, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AIBlogWriterMarketingPage() {
  const containerRef = useRef(null);
  const mockupRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <div ref={containerRef} className="relative isolate overflow-hidden bg-slate-950 text-slate-100 min-h-screen">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:pt-32 lg:px-8 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Enterprise Content Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 leading-tight">
            AI Content That Actually <br />
            <span className="bg-gradient-to-r from-primary via-accent to-emerald-400 bg-clip-text text-transparent">
              Ranks on Search Engines
            </span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-400 max-w-2xl mx-auto mb-8">
            Recreate the GravityWrite experience with enterprise-grade precision. Long-form articles, real-time SEO scoring, and human-like intelligence.
          </p>

          <div className="flex items-center justify-center gap-x-4">
            <Link
              href="/blog"
              className="group relative flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
            >
              Start Generating Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-4 py-3"
            >
              View Features <Zap className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Mockup with Motion */}
        <motion.div 
          ref={mockupRef}
          style={{ scale, y }}
          className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-3xl shadow-2xl"
        >
          <div className="relative rounded-xl border border-white/10 bg-slate-950 overflow-hidden aspect-[16/9]">
             {/* Mock UI Elements */}
             <div className="absolute inset-0 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 rounded-md bg-white/5" />
                    <div className="h-6 w-28 rounded-md bg-primary/20 border border-primary/30" />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-6 h-full">
                  <div className="col-span-8 space-y-3">
                    <div className="h-8 w-3/4 rounded-md bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-full rounded bg-white/5" />
                      <div className="h-3.5 w-full rounded bg-white/5" />
                      <div className="h-3.5 w-5/6 rounded bg-white/5" />
                      <div className="h-3.5 w-full rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="col-span-4 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-slate-300">SEO Score</span>
                          <span className="text-emerald-400 font-bold text-xs font-mono">92/100</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[92%]" />
                       </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                       <div className="h-3.5 w-2/3 rounded bg-white/10" />
                       <div className="h-3 w-full rounded bg-white/5" />
                       <div className="h-3 w-full rounded bg-white/5" />
                    </div>
                  </div>
                </div>
             </div>

             {/* Floating Elements */}
             <div className="absolute -top-6 -right-6 p-4 rounded-xl bg-primary text-primary-foreground shadow-xl">
                <Cpu className="h-6 w-6" />
             </div>
             <div className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-accent text-accent-foreground shadow-xl">
                <Target className="h-6 w-6" />
             </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div id="features" className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Everything you need to dominate SERPs</h2>
          <p className="mt-2 text-sm text-slate-400">Enterprise content generation features engineered for organic search.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <FeatureCard 
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              title="Semantic Optimization"
              description="Our AI doesn't just use keywords; it understands search intent and semantic relationships."
           />
           <FeatureCard 
              icon={<Shield className="h-5 w-5 text-emerald-400" />}
              title="Humanized Output"
              description="Proprietary models that pass AI checks while maintaining high factual accuracy."
           />
           <FeatureCard 
              icon={<FileText className="h-5 w-5 text-accent" />}
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
    <div className="p-6 rounded-xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all duration-200">
      <div className="mb-4 inline-flex p-2.5 rounded-lg bg-slate-900 border border-white/10">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
