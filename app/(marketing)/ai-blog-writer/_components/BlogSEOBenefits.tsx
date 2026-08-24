"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Search, MousePointerClick, Award, Globe, Layers } from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{mounted ? count.toLocaleString() : "0"}{suffix}</span>;
}

const BENEFITS = [
  {
    icon: Search,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Keyword-Perfect Structure",
    description: "Every article is built around your target keyword with semantic LSI terms, proper header hierarchy, and FAQ sections that trigger rich snippets.",
    bullets: ["Auto keyword clustering", "LSI + semantic coverage", "Featured snippet optimization"],
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Topical Authority Building",
    description: "Our AI maps content clusters and internal linking strategies to build domain authority systematically, not just article by article.",
    bullets: ["Content cluster mapping", "Auto internal link suggestions", "Pillar page architecture"],
  },
  {
    icon: Globe,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Technical SEO Automation",
    description: "Schema.org markup, canonical tags, Open Graph meta, and structured data automatically injected into every export.",
    bullets: ["JSON-LD schema generation", "Open Graph & Twitter Cards", "Core Web Vitals-friendly HTML"],
  },
];

const STATS = [
  { icon: TrendingUp, value: 312, suffix: "%", label: "Avg. organic traffic increase", color: "text-emerald-400" },
  { icon: Search, value: 94, suffix: "/100", label: "Average SEO score per article", color: "text-blue-400" },
  { icon: MousePointerClick, value: 2.7, suffix: "x", label: "Higher CTR from rich snippets", color: "text-violet-400" },
  { icon: Award, value: 68, suffix: "%", label: "Articles rank page 1 in 90 days", color: "text-rose-400" },
  { icon: Globe, value: 40, suffix: "+", label: "Languages supported", color: "text-cyan-400" },
  { icon: Layers, value: 8000, suffix: "+", label: "Max words per article", color: "text-yellow-400" },
];

export default function BlogSEOBenefits() {
  return (
    <section id="seo-benefits" className="relative py-32 bg-background dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
            <TrendingUp className="h-4 w-4" />
            SEO-First by Design
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-950 dark:text-white mb-6 leading-[1.05]">
            Content engineered to{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
              rank and convert
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            SEO isn't an afterthought — it's baked into every word our AI generates. We follow
            Google's quality guidelines, E-E-A-T signals, and Helpful Content standards.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] text-center"
              >
                <Icon className={`h-5 w-5 mx-auto mb-3 ${stat.color}`} />
                <div className={`text-3xl font-black tracking-tight mb-1 ${stat.color}`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Benefit cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                className="group p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-500"
              >
                <div className={`inline-flex p-3.5 rounded-2xl border mb-6 ${benefit.bg}`}>
                  <Icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${benefit.color.replace("text-", "bg-")}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
