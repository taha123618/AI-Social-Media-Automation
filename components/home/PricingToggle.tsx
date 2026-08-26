"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  billingCycle: "month" | "year";
  onChange: (cycle: "month" | "year") => void;
}

export const PricingToggle = ({ billingCycle, onChange }: PricingToggleProps) => {
  return (
    <div className="inline-flex items-center bg-secondary/80 p-1.5 rounded-xl border border-border/70 shadow-xs relative">
      {/* Sliding active indicator */}
      <motion.div
        layoutId="pricing-toggle-indicator"
        className="absolute top-1.5 bottom-1.5 rounded-lg bg-card shadow-sm border border-border/60"
        style={{
          left: billingCycle === "month" ? "6px" : "50%",
          width: "calc(50% - 6px)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => onChange("month")}
        className={`relative z-10 px-5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 flex-1 ${
          billingCycle === "month"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>

      <button
        onClick={() => onChange("year")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 flex-1 ${
          billingCycle === "year"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>Annual</span>
        <span className="bg-primary/10 border border-primary/25 text-primary text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
          -20%
        </span>
      </button>
    </div>
  );
};
