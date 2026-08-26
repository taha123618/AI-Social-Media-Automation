"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { useGSAP } from "@gsap/react";
import { Users, FileText, TrendingUp, Star, Globe, Clock } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

const STATS = [
  {
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    target: 24700,
    suffix: "+",
    label: "Active users",
    description: "Content creators, SEO agencies, and enterprise teams trusting our platform daily.",
  },
  {
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    target: 1200000,
    suffix: "+",
    label: "Articles generated",
    description: "Long-form, SEO-optimized articles written and published through our platform.",
  },
  {
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    target: 312,
    suffix: "%",
    label: "Avg. traffic increase",
    description: "Measured across customer domains in the first 90 days of publishing AI content.",
  },
  {
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    target: 49,
    suffix: "/5",
    decimals: 1,
    label: "Average rating",
    description: "Rated by over 2,400 verified users on G2, Capterra, and Product Hunt.",
  },
  {
    icon: Globe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    target: 140,
    suffix: "+",
    label: "Countries served",
    description: "Teams from New York to Tokyo using our platform to grow organic reach globally.",
  },
  {
    icon: Clock,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    target: 8,
    suffix: "hrs",
    label: "Saved per article",
    description: "Average time saved vs. manual research, writing, and SEO optimization workflows.",
  },
];

const BRANDS = ["Shopify", "HubSpot", "Semrush", "Moz", "Ahrefs", "Notion", "Intercom", "Drift", "Clearbit", "Buffer"];

function StatCard({ stat, index }: { stat: (typeof STATS)[0]; index: number }) {
  const { ref, formatted } = useCountUp({
    end: stat.target,
    decimals: stat.decimals || 0,
    suffix: stat.suffix,
  });
  const Icon = stat.icon;

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
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-2xl border mb-6 ${stat.bg}`}>
          <Icon className={`h-6 w-6 ${stat.color}`} />
        </div>
        <div className={`text-5xl font-black tracking-tighter mb-1 ${stat.color}`}>
          {formatted}
        </div>
        <p className="text-base font-bold text-foreground mb-3">{stat.label}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!marqueeRef.current) return;
    const marquee = marqueeRef.current;
    const duration = 30;

    gsap.to(marquee, {
      xPercent: -50,
      duration,
      ease: "none",
      repeat: -1,
    });

    marquee.addEventListener("mouseenter", () => {
      gsap.to(marquee, { timeScale: 0.3, duration: 0.4 });
    });

    marquee.addEventListener("mouseleave", () => {
      gsap.to(marquee, { timeScale: 1, duration: 0.4 });
    });
  }, []);

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
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
            Real numbers from real customers. Every metric is verified and audited quarterly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Marquee */}
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
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
            <div
              ref={marqueeRef}
              className="flex gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700"
            >
              {[...BRANDS, ...BRANDS].map((brand, i) => (
                <span
                  key={`${brand}-${i}`}
                  className="text-xl font-black text-foreground tracking-tighter flex-shrink-0 whitespace-nowrap"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
