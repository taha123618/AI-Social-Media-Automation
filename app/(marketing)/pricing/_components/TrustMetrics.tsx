"use client";

import { Info } from "lucide-react";
import React from "react";

const metrics = [
  {
    value: "14-DAY",
    label: "FREE FLEET TRIAL"
  },
  {
    value: "99.99%",
    label: "WORKER UPTIME"
  },
  {
    value: "25K+",
    label: "ACTIVE WORKSPACES"
  }
];

export const TrustMetrics = () => {
  return (
    <div className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-none border border-border bg-card text-center"
            >
              <div className="text-2xl font-mono font-black text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground font-mono text-xs">
          <Info className="w-3.5 h-3.5 text-primary" />
          <p>
            All subscriptions are billed in USD. Scale or cancel at period end with zero penalty fees.
          </p>
        </div>
      </div>
    </div>
  );
};
