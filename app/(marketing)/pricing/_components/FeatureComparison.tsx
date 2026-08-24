"use client";

import { Check, Minus } from "lucide-react";
import React from "react";

const features = [
  {
    category: "AI Generation",
    items: [
      { name: "AI Post Generator", free: "5/mo", starter: "50/mo", pro: "Unlimited" },
      { name: "Brand Voice Training", free: false, starter: "1 voice", pro: "Unlimited" },
      { name: "AI Image Generation", free: false, starter: true, pro: true },
      { name: "Video Hooks & Scripts", free: false, starter: true, pro: true },
    ]
  },
  {
    category: "Social Management",
    items: [
      { name: "Supported Platforms", free: "2", starter: "All", pro: "All" },
      { name: "Content Scheduler", free: false, starter: true, pro: true },
      { name: "Bulk Importing", free: false, starter: false, pro: true },
      { name: "Analytics Dashboard", free: "Basic", starter: "Advanced", pro: "Enterprise" },
    ]
  },
  {
    category: "Support & Security",
    items: [
      { name: "Support Response", free: "48 hours", starter: "24 hours", pro: "Under 1 hour" },
      { name: "Team Collaboration", free: false, starter: false, pro: "Up to 5 members" },
      { name: "API Access", free: false, starter: false, pro: true },
      { name: "Custom Domain", free: false, starter: false, pro: true },
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
              <th className="py-6 font-black text-[#2D46FF] dark:text-blue-400 px-4 text-center">Starter</th>
              <th className="py-6 font-black text-slate-400 dark:text-slate-600 px-4 text-center">Pro</th>
            </tr>
          </thead>
          <tbody>
            {features.map((section, idx) => (
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
                    <td className="py-5 px-4 text-center text-sm font-bold text-slate-500 dark:text-slate-500">
                      {typeof item.pro === 'string' ? item.pro : (item.pro ? <Check className="w-4 h-4 mx-auto text-slate-400 dark:text-slate-500" /> : <Minus className="w-4 h-4 mx-auto text-slate-200 dark:text-slate-800" />)}
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
