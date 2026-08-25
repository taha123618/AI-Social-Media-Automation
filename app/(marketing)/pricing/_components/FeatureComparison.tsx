"use client";

import { Check, Minus } from "lucide-react";
import React from "react";

const comparisonSections = [
  {
    category: "AI Content Generation",
    items: [
      { name: "AI Social Posts", free: "5 / MO", starter: "50 / MO", pro: "UNLIMITED" },
      { name: "AI Blog Articles", free: "20 / MO", starter: "100 / MO", pro: "UNLIMITED" },
      { name: "Article Word Limit", free: "3,000 WORDS", starter: "8,000 WORDS", pro: "UNLIMITED" },
      { name: "Brand Voice Profiles", free: "1 PROFILE", starter: "5 PROFILES", pro: "UNLIMITED" },
      { name: "AI Voice Training", free: false, starter: false, pro: true },
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
      { name: "Analytics Dashboard", free: "BASIC", starter: "ADVANCED", pro: "ATTRIBUTION ENGINE" },
    ]
  },
  {
    category: "Collaboration, API & Support",
    items: [
      { name: "Team Collaboration & Seats", free: false, starter: false, pro: true },
      { name: "White-Label Reports & Exports", free: false, starter: false, pro: true },
      { name: "Developer REST API Access", free: false, starter: false, pro: true },
      { name: "Custom Model Fine-Tuning", free: false, starter: false, pro: true },
      { name: "Support Tier", free: "COMMUNITY", starter: "PRIORITY", pro: "DEDICATED CSM + SLA" },
    ]
  }
];

export const FeatureComparison = () => {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 border-t border-border">
      <div className="text-center mb-10">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
          CAPABILITY MATRIX
        </p>
        <h2 className="text-2xl font-mono font-black uppercase text-foreground tracking-tight">
          DETAILED FLEET COMPARISON
        </h2>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="border-b border-border bg-secondary/80">
              <th className="py-3 px-4 font-bold text-muted-foreground uppercase text-[10px] w-1/3">CAPABILITY</th>
              <th className="py-3 px-4 font-bold text-foreground text-xs text-center border-l border-border">FREE</th>
              <th className="py-3 px-4 font-bold text-primary text-xs text-center border-l border-border">STARTER ($29/MO)</th>
              <th className="py-3 px-4 font-bold text-foreground text-xs text-center border-l border-border">PRO ($99/MO)</th>
            </tr>
          </thead>
          <tbody>
            {comparisonSections.map((section, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-secondary/40 border-b border-border">
                  <td colSpan={4} className="py-2.5 px-4 font-bold text-primary text-[11px] uppercase tracking-wider">
                    // {section.category}
                  </td>
                </tr>
                {section.items.map((item, i) => (
                  <tr key={i} className="border-b border-border hover:bg-secondary/30 transition-none">
                    <td className="py-2.5 px-4 text-xs text-foreground font-medium">{item.name}</td>
                    <td className="py-2.5 px-4 text-center text-xs text-muted-foreground border-l border-border">
                      {typeof item.free === 'string' ? item.free : (item.free ? <Check className="w-3.5 h-3.5 mx-auto text-primary" /> : <Minus className="w-3.5 h-3.5 mx-auto text-muted-foreground/40" />)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-xs text-foreground border-l border-border">
                      {typeof item.starter === 'string' ? item.starter : (item.starter ? <Check className="w-3.5 h-3.5 mx-auto text-primary" /> : <Minus className="w-3.5 h-3.5 mx-auto text-muted-foreground/40" />)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-xs text-primary font-bold border-l border-border">
                      {typeof item.pro === 'string' ? item.pro : (item.pro ? <Check className="w-3.5 h-3.5 mx-auto text-primary" /> : <Minus className="w-3.5 h-3.5 mx-auto text-muted-foreground/40" />)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
