"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  billingCycle: "month" | "year";
  onChange: (cycle: "month" | "year") => void;
}

export const PricingToggle = ({ billingCycle, onChange }: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-16">
      <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === "month" ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-slate-600"
        }`}>
        Monthly
      </span>

      <button
        onClick={() => onChange(billingCycle === "month" ? "year" : "month")}
        className="cursor-pointer w-16 h-8 rounded-full bg-slate-100 dark:bg-slate-800 relative p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <motion.div
          animate={{ x: billingCycle === "month" ? 0 : 32 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 rounded-full bg-[#2D46FF] shadow-lg shadow-blue-200 dark:shadow-none"
        />
      </button>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === "year" ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-slate-600"
          }`}>
          Yearly
        </span>
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
          Save 20%
        </span>
      </div>
    </div>
  );
};
