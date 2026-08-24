"use client";

import { Info } from "lucide-react";
import React from "react";

const metrics = [
  {
    value: "7 Days",
    label: "Refund Policy*"
  },
  {
    value: "24/7",
    label: "Support Team"
  },
  {
    value: "2 Million+",
    label: "Users Worldwide"
  }
];

export const TrustMetrics = () => {
  return (
    <div className="py-12 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-10 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300"
            >
              <div className="text-3xl font-black text-slate-950 dark:text-white mb-3 tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs">
          <Info className="w-4 h-4" />
          <p>
            All pricing is in USD. You can change plans or cancel your account at any time, prior to renewal
          </p>
        </div>
      </div>
    </div>
  );
};
