"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, FileText, TrendingUp, Star, Globe, Clock } from "lucide-react";

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref, mounted };
}

const STATS = [
  {
    icon: Users,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    target: 24700,
    suffix: "+",
    label: "Active users",
    description: "Content creators, SEO agencies, and enterprise teams trusting our platform daily.",
  },
  {
    icon: FileText,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    target: 1200000,
    suffix: "+",
    label: "Articles generated",
    description: "Long-form, SEO-optimized articles written and published through our platform.",
  },
  {
    icon: TrendingUp,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    target: 312,
    suffix: "%",
    label: "Avg. traffic increase",
    description: "Measured across customer domains in the first 90 days of publishing AI content.",
  },
  {
    icon: Star,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    target: 49,
    suffix: "/5",
    decimals: 1,
    label: "Average rating",
    description: "Rated by over 2,400 verified users on G2, Capterra, and Product Hunt.",
  },
  {
    icon: Globe,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    target: 140,
    suffix: "+",
    label: "Countries served",
    description: "Teams from New York to Tokyo using our platform to grow organic reach globally.",
  },
  {
    icon: Clock,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    target: 8,
    suffix: "hrs",
    label: "Saved per article",
    description: "Average time saved vs. manual research, writing, and SEO optimization workflows.",
  },
];

function StatCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[0];
  index: number;
}) {
  const { count, ref, mounted } = useCounter(stat.target);
  const Icon = stat.icon;
  const displayValue = !mounted
    ? "0"
    : "decimals" in stat
    ? (count / 10).toFixed(1)
    : count >= 1000000
    ? `${(count / 1000000).toFixed(1)}M`
    : count >= 1000
    ? `${(count / 1000).toFixed(0)}K`
    : count.toString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative p-8 rounded-3xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-500 overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-2xl border mb-6 ${stat.iconBg}`}>
          <Icon className={`h-6 w-6 ${stat.iconColor}`} />
        </div>

        {/* Counter */}
        <div className={`text-5xl font-black tracking-tighter mb-1 ${stat.iconColor}`}>
          {displayValue}
          {stat.suffix}
        </div>

        {/* Label */}
        <p className="text-base font-bold text-foreground mb-3">{stat.label}</p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
      </div>
    </motion.div>
  );
}

export default function BlogStats() {
  return (
    <section id="stats" className="relative py-32 bg-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none dark:bg-primary/5" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none dark:bg-primary/5" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 mb-6">
            <TrendingUp className="h-4 w-4" />
            By the Numbers
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              24,700+ creators
            </span>{" "}
            worldwide
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Real numbers from real customers. We don&apos;t pad our stats — every metric below is
            verified and audited quarterly.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Marquee logos strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 border-t border-border pt-16"
        >
          <p className="text-center text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-10">
            Trusted by teams at
          </p>
          <div className="flex gap-12 whitespace-nowrap overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex gap-12 animate-scroll-x opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
              {["SHOPIFY", "HUBSPOT", "SEMRUSH", "MOZ", "AHREFS", "NOTION", "INTERCOM", "DRIFT", "CLEARBIT", "BUFFER"].map(
                (brand) => (
                  <span key={brand} className="text-xl font-black text-foreground tracking-tighter flex-shrink-0">
                    {brand}
                  </span>
                )
              )}
              {["SHOPIFY", "HUBSPOT", "SEMRUSH", "MOZ", "AHREFS", "NOTION", "INTERCOM", "DRIFT", "CLEARBIT", "BUFFER"].map(
                (brand) => (
                  <span key={brand + "_2"} className="text-xl font-black text-foreground tracking-tighter flex-shrink-0">
                    {brand}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
