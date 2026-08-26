"use client";

import { Check, Minus } from "lucide-react";
import React from "react";

const comparisonSections = [
  {
    category: "AI Content Generation",
    items: [
      { name: "AI Social Posts", free: "5 / mo", starter: "50 / mo", pro: "Unlimited" },
      { name: "AI Blog Articles", free: "20 / mo", starter: "100 / mo", pro: "Unlimited" },
      { name: "Article Word Limit", free: "3,000 words", starter: "8,000 words", pro: "Unlimited" },
      { name: "Brand Voice Profiles", free: "1 profile", starter: "5 profiles", pro: "Unlimited" },
      { name: "AI Voice Fine-Tuning", free: false, starter: false, pro: true },
      { name: "AI Detection Bypass", free: false, starter: true, pro: true },
    ]
  },
  {
    category: "SEO & Growth Engine",
    items: [
      { name: "Real-time SEO Scoring", free: true, starter: true, pro: true },
      { name: "Topical Cluster Mapping", free: false, starter: true, pro: true },
      { name: "Topical Cluster Strategy", free: false, starter: false, pro: true },
      { name: "Auto Internal Linking", free: false, starter: true, pro: true },
      { name: "Google Search Console Sync", free: false, starter: true, pro: true },
    ]
  },
  {
    category: "Publishing, Social & CMS",
    items: [
      { name: "Social Post Scheduling", free: false, starter: true, pro: true },
      { name: "WordPress & Ghost Export", free: true, starter: true, pro: true },
      { name: "1-Click CMS Publishing (Webflow, Shopify)", free: false, starter: true, pro: true },
      { name: "Analytics Dashboard", free: "Basic", starter: "Advanced", pro: "Advanced + Attribution" },
    ]
  },
  {
    category: "Collaboration, API & Support",
    items: [
      { name: "Team Collaboration & Seats", free: false, starter: false, pro: true },
      { name: "White-Label Reports & Exports", free: false, starter: false, pro: true },
      { name: "Developer REST API Access", free: false, starter: false, pro: true },
      { name: "Dedicated Swarm Compute", free: false, starter: false, pro: true },
      { name: "Support SLA", free: "Community", starter: "Priority", pro: "Dedicated CSM + 99.9% SLA" },
    ]
  }
];

export const FeatureComparison = () => {
  return (
    <div className="py-20 max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
          MATRIX COMPARISON
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Comprehensive Feature <span className="text-primary">Breakdown</span>
        </h2>
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/70">
                <th className="py-3.5 px-5 font-bold text-foreground">Capability</th>
                <th className="py-3.5 px-4 font-bold text-foreground text-center w-28">Free</th>
                <th className="py-3.5 px-4 font-bold text-primary text-center w-32 bg-primary/5">Starter</th>
                <th className="py-3.5 px-4 font-bold text-foreground text-center w-36">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {comparisonSections.map((section) => (
                <React.Fragment key={section.category}>
                  <tr className="bg-muted/20">
                    <td colSpan={4} className="py-2.5 px-5 font-bold uppercase tracking-wider text-[11px] text-foreground/80">
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.name} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-5 text-foreground font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                        {typeof item.free === "boolean" ? (
                          item.free ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.free
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-primary bg-primary/5">
                        {typeof item.starter === "boolean" ? (
                          item.starter ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.starter
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.pro
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
