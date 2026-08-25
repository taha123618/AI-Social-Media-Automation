"use client";

import { Info } from "lucide-react";
import React from "react";

const metrics = [
  {
    value: "14 Days",
    label: "Risk-Free Trial"
  },
  {
    value: "99.9%",
    label: "Uptime SLA Guarantee"
  },
  {
    value: "25,000+",
    label: "Active Creator Fleets"
  }
];

export const TrustMetrics = () => {
  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/80 bg-card text-center hover:border-primary/40 transition-all duration-200"
            >
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs text-center">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <p>
            All subscriptions are billed in USD. Upgrade, downgrade, or cancel anytime from your operator console.
          </p>
        </div>
      </div>
    </div>
  );
};
