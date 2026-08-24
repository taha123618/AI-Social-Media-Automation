"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Search, FileText, Shield, Zap, Globe, BarChart3, Mic2, RefreshCw } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const Icon = feature.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`group relative p-8 rounded-3xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-500 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className={`inline-flex p-3.5 rounded-2xl border mb-6 ${feature.bg}`}>
          <Icon className={`h-6 w-6 ${feature.color}`} />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
      </div>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Brain, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Semantic Intelligence", description: "Goes beyond keywords — understands topical depth, entity relationships, and search intent to craft content that dominates SERPs." },
  { icon: Search, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "Real-Time SEO Scoring", description: "Live 100-point SEO analysis as you generate. Checks keyword density, headings, meta, readability, and NLP co-occurrence in real time." },
  { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Long-Form Engine", description: "Generate 2,500–8,000+ word pillar articles, listicles, how-tos, and case studies with proper H1–H6 structure and internal link suggestions." },
  { icon: Shield, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", title: "AI Detection Bypass", description: "Proprietary humanization layer produces writing that passes Originality.ai, GPTZero, and Turnitin with consistent brand authenticity." },
  { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", title: "One-Click Publishing", description: "Publish directly to WordPress, Webflow, Shopify, or Ghost. Schema markup and canonical tags auto-generated on export." },
  { icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", title: "40+ Language Support", description: "Localize articles for any market with cultural intelligence. Regional slang, date formats, and audience tone automatically adapted." },
  { icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", title: "Performance Analytics", description: "Track each article's ranking progress, organic traffic, and conversion rate in a unified dashboard. Know exactly what drives ROI." },
  { icon: Mic2, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", title: "Brand Voice Training", description: "Upload existing content and our AI learns your unique tone, vocabulary, and writing style. Every article sounds authentically yours." },
  { icon: RefreshCw, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", title: "Auto-Repurposing", description: "Turn one blog post into 10 social media posts, an email newsletter, a LinkedIn article, and a YouTube script automatically." },
];

export default function BlogFeatures() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal({ threshold: 0.05 });
  return (
    <section ref={sectionRef} id="features" className={`relative py-32 bg-background overflow-hidden transition-opacity duration-700 ${sectionVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none dark:bg-primary/5" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-400 mb-6">
            <Zap className="h-4 w-4" />
            Packed with Power
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Everything great content{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              needs to succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our AI Blog Writer combines GPT-5-class language models with real-time SEO data,
            competitor analysis, and brand intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature as any} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
