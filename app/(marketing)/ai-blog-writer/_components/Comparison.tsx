"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const COMPARISON_ROWS = [
  { feature: "Real-Time SEO Scoring", us: true, others: "Manual audit required" },
  { feature: "AI Detection Bypass", us: true, others: false },
  { feature: "Brand Voice Training", us: true, others: "Generic output only" },
  { feature: "Long-Form (8,000+ words)", us: true, others: "Limited to 1,000 words" },
  { feature: "Multi-Language Support", us: "40+ languages", others: "English only" },
  { feature: "One-Click CMS Export", us: true, others: "Manual copy-paste" },
  { feature: "Google Search Console Sync", us: true, others: "Not available" },
  { feature: "Auto Internal Linking", us: true, others: "Manual" },
  { feature: "Team Collaboration", us: true, others: "Single user" },
  { feature: "Custom Templates", us: true, others: "Limited presets" },
];

export default function Comparison() {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400 mb-6">
            <Sparkles className="h-4 w-4" />
            Why Choose Us
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Built different.{" "}
            <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Results are different.
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-border"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-0 bg-muted/50 border-b border-border">
            <div className="p-5 font-bold text-foreground">Feature</div>
            <div className="p-5 font-black text-primary text-center bg-primary/5">Our Platform</div>
            <div className="p-5 font-bold text-muted-foreground text-center">Others</div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`grid grid-cols-3 gap-0 border-b border-border last:border-0 ${
                i % 2 === 0 ? "bg-background" : "bg-muted/20"
              }`}
            >
              <div className="p-5 text-sm text-foreground font-medium">{row.feature}</div>
              <div className="p-5 text-center">
                {typeof row.us === "boolean" ? (
                  row.us ? <Check className="h-5 w-5 text-emerald-400 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />
                ) : (
                  <span className="text-sm font-bold text-emerald-400">{row.us}</span>
                )}
              </div>
              <div className="p-5 text-center">
                {typeof row.others === "boolean" ? (
                  row.others ? <Check className="h-5 w-5 text-emerald-400 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />
                ) : (
                  <span className="text-sm text-muted-foreground">{row.others}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
