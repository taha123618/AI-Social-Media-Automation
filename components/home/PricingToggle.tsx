"use client";

interface PricingToggleProps {
  billingCycle: "month" | "year";
  onChange: (cycle: "month" | "year") => void;
}

export const PricingToggle = ({ billingCycle, onChange }: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <div className="inline-flex items-center p-1 bg-secondary border border-border rounded-none">
        <button
          onClick={() => onChange("month")}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
            billingCycle === "month"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          MONTHLY
        </button>
        <button
          onClick={() => onChange("year")}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
            billingCycle === "year"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ANNUAL (SAVE 20%)
        </button>
      </div>
    </div>
  );
};
