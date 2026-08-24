"use client";

import { Check, Minus } from "lucide-react";
import React from "react";
import { PLANS } from "@/features/billing/config/plans.config";

const comparisonSections = [
  {
    category: "AI Content Generation",
    items: [
      { name: "AI Social Posts", free: "5 / mo", starter: "50 / mo", pro: "Unlimited" },
      { name: "AI Blog Articles", free: "20 / mo", starter: "100 / mo", pro: "Unlimited" },
      { name: "Article Word Limit", free: "3,000 words", starter: "8,000 words", pro: "Unlimited" },
      { name: "Brand Voice Profiles", free: "1 profile", starter: "5 profiles", pro: "Unlimited" },
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
      { name: "Analytics Dashboard", free: "Basic", starter: "Advanced", pro: "Advanced + Attribution" },
    ]
  },
  {
    category: "Collaboration, API & Support",
    items: [
      { name: "Team Collaboration & Seats", free: false, starter: false, pro: true },
      { name: "White-Label Reports & Exports", free: false, starter: false, pro: true },
      { name: "Developer REST API Access", free: false, starter: false, pro: true },
      { name: "Custom Model Fine-Tuning", free: false, starter: false, pro: true },
      { name: "Support Tier", free: "Standard", starter: "Priority", pro: "Dedicated CSM + SLA" },
    ]
  }
];

export const FeatureComparison = () => {
  return (
    <div className="py-24 max-w-5xl mx-auto px-4">
      <h2 className="text-3xl font-black text-slate-950 dark:text-white mb-16 text-center tracking-tight">
        Compare our <span className="text-[#2D46FF] dark:text-blue-500">plans</span> in detail
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="py-6 font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-[10px] w-1/3">Features</th>
              <th className="py-6 font-black text-slate-950 dark:text-white px-4 text-center">Free</th>
              <th className="py-6 font-black text-[#2D46FF] dark:text-blue-400 px-4 text-center">Starter ($29/mo)</th>
              <th className="py-6 font-black text-indigo-600 dark:text-indigo-400 px-4 text-center">Pro ($99/mo)</th>
            </tr>
          </thead>
          <tbody>
            {comparisonSections.map((section, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                  <td colSpan={4} className="py-4 px-6 font-black text-slate-950 dark:text-white text-xs uppercase tracking-widest">
                    {section.category}
                  </td>
                </tr>
                {section.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-5 px-6 font-bold text-slate-600 dark:text-slate-400 text-sm">{item.name}</td>
                    <td className="py-5 px-4 text-center text-sm font-bold text-slate-500 dark:text-slate-500">
                      {typeof item.free === 'string' ? item.free : (item.free ? <Check className="w-4 h-4 mx-auto text-green-500 dark:text-green-400" /> : <Minus className="w-4 h-4 mx-auto text-slate-200 dark:text-slate-800" />)}
                    </td>
                    <td className="py-5 px-4 text-center text-sm font-bold text-slate-950 dark:text-white">
                      {typeof item.starter === 'string' ? item.starter : (item.starter ? <Check className="w-4 h-4 mx-auto text-[#2D46FF] dark:text-blue-400" /> : <Minus className="w-4 h-4 mx-auto text-slate-200 dark:text-slate-800" />)}
                    </td>
                    <td className="py-5 px-4 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {typeof item.pro === 'string' ? item.pro : (item.pro ? <Check className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400" /> : <Minus className="w-4 h-4 mx-auto text-slate-200 dark:text-slate-800" />)}
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
