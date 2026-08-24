"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Minus, Scale } from "lucide-react";
import Link from "next/link";

type CellValue = true | false | null | string;

interface ComparisonRow {
  feature: string;
  ours: CellValue;
  gravitywrite: CellValue;
  jasper: CellValue;
  manual: CellValue;
}

const ROWS: ComparisonRow[] = [
  { feature: "Real-time SEO scoring (100pt)", ours: true, gravitywrite: false, jasper: false, manual: false },
  { feature: "AI Detection bypass", ours: true, gravitywrite: false, jasper: false, manual: true },
  { feature: "Articles up to 8,000 words", ours: true, gravitywrite: "3,000", jasper: "3,000", manual: true },
  { feature: "Brand voice training", ours: true, gravitywrite: false, jasper: true, manual: true },
  { feature: "One-click CMS publishing", ours: true, gravitywrite: false, jasper: true, manual: false },
  { feature: "Competitor content analysis", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "Auto internal linking", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "Schema / structured data", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "Topical cluster mapping", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "Google Search Console sync", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "40+ language localization", ours: true, gravitywrite: true, jasper: true, manual: null },
  { feature: "Content repurposing", ours: true, gravitywrite: false, jasper: false, manual: null },
  { feature: "Avg. time per article", ours: "~10 min", gravitywrite: "~15 min", jasper: "~20 min", manual: "6–10 hrs" },
  { feature: "Starting price / month", ours: "$29", gravitywrite: "$19", jasper: "$39", manual: "$0" },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20">
        <X className="h-3.5 w-3.5 text-rose-400" />
      </span>
    );
  if (value === null)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7">
        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    );
  return <span className="text-sm font-semibold text-foreground">{value}</span>;
}

const COLS = [
  { label: "SocialAI Blog", sub: "← You're here", highlight: true },
  { label: "GravityWrite", sub: "Competitor", highlight: false },
  { label: "Jasper AI", sub: "Competitor", highlight: false },
  { label: "Manual Writing", sub: "Traditional", highlight: false },
];

export default function BlogComparison() {
  return (
    <section id="comparison" className="relative py-32 bg-background overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none dark:bg-primary/5" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 mb-6">
            <Scale className="h-4 w-4" />
            How We Compare
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            The clear choice for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              serious content teams
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We set out to build the AI blog writer we always wished existed. Here&apos;s how we stack
            up against the alternatives.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[640px] border-collapse">
            {/* Column headers */}
            <thead>
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest w-1/3">
                  Feature
                </th>
                {COLS.map((col) => (
                  <th
                    key={col.label}
                    className={`px-4 py-4 text-center rounded-t-2xl ${
                      col.highlight
                        ? "bg-blue-600/10 border-x border-t border-blue-500/20"
                        : ""
                    }`}
                  >
                    <p className={`text-sm font-black ${col.highlight ? "text-primary" : "text-foreground"}`}>
                      {col.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${col.highlight ? "text-primary" : "text-muted-foreground"}`}>
                      {col.sub}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-t border-border ${i % 2 === 0 ? "bg-card/30" : ""}`}
                >
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{row.feature}</td>
                  {[row.ours, row.gravitywrite, row.jasper, row.manual].map((val, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-4 text-center ${
                        ci === 0 ? "bg-primary/10 border-x border-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Cell value={val} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {/* Footer */}
            <tfoot>
              <tr className="border-t border-border">
                <td className="px-6 py-4" />
                {COLS.map((col) => (
                  <td
                    key={col.label}
                    className={`px-4 py-4 text-center rounded-b-2xl ${
                      col.highlight
                      ? "bg-primary/10 border-x border-b border-primary/20"
                        : ""
                    }`}
                  >
                    {col.highlight && (
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                      >
                        Get started free
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
