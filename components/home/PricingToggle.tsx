"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  billingCycle: "month" | "year";
  onChange: (cycle: "month" | "year") => void;
}

export const PricingToggle = ({ billingCycle, onChange }: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-3 bg-secondary/80 p-1.5 rounded-xl border border-border/80 shadow-xs">
      <button
        onClick={() => onChange("month")}
        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          billingCycle === "month"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>

      <button
        onClick={() => onChange("year")}
        className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          billingCycle === "year"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>Annual</span>
        <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
          -20%
        </span>
      </button>
    </div>
  );
};
