"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Target, Eye, Zap, Award } from "lucide-react";

const BENEFITS = [
  {
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Keyword-Optimized Content",
    description: "AI automatically identifies and places primary and LSI keywords at optimal density (1-2%) for maximum ranking potential without keyword stuffing.",
    stat: "2.3x",
    statLabel: "Higher Rankings",
  },
  {
    icon: Eye,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Featured Snippet Optimization",
    description: "Content structured for Google's featured snippets, People Also Ask, and rich results. Our AI formats answers for voice search and position zero.",
    stat: "47%",
    statLabel: "Snippet Capture Rate",
  },
  {
    icon: Award,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "EEAT Compliance",
    description: "Built-in Experience, Expertise, Authoritativeness, and Trustworthiness signals. Content demonstrates first-hand expertise and credible sourcing.",
    stat: "94/100",
    statLabel: "EEAT Score",
  },
];

export default function SEOBenefits() {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 mb-6">
            <Search className="h-4 w-4" />
            SEO That Actually Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Engineered to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              dominate search results
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every article is built from the ground up with Google&apos;s ranking factors in mind.
            Not just keywords — real SEO architecture.
          </p>
        </motion.div>

        {/* Top-level stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: TrendingUp, label: "Avg. Traffic Boost", value: "312%", color: "text-emerald-400" },
            { icon: Search, label: "Keywords Ranked", value: "14.7K", color: "text-blue-400" },
            { icon: Zap, label: "Avg. Time to Rank", value: "9 Days", color: "text-violet-400" },
            { icon: Award, label: "Avg. SEO Score", value: "88/100", color: "text-amber-400" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-6 rounded-2xl border border-border bg-card/50 text-center">
                <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                <div className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Deep-dive cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
                className="group relative p-8 rounded-3xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-500"
              >
                <div className={`inline-flex p-3.5 rounded-2xl border mb-5 ${benefit.bg}`}>
                  <Icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {benefit.description}
                </p>
                <div className="pt-4 border-t border-border">
                  <div className={`text-2xl font-black ${benefit.color}`}>{benefit.stat}</div>
                  <div className="text-xs text-muted-foreground">{benefit.statLabel}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
