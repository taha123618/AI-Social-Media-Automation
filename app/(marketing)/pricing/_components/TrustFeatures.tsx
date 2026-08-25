"use client";
import { Headphones, CreditCard, BookOpen, ShieldCheck } from "lucide-react";

const trustFeatures = [
  {
    title: "Continuous Dedicated Support",
    description: "24/7 technical operator assistance and rapid resolution response for multi-tenant and enterprise fleets.",
    icon: <Headphones className="w-4 h-4 text-primary" />,
  },
  {
    title: "Flexible Seat & Usage Scaling",
    description: "Upgrade or downgrade your operational tier anytime without lock-in. Quota allocation automatically adjusts.",
    icon: <CreditCard className="w-4 h-4 text-primary" />,
  },
  {
    title: "API Directives & Knowledge Docs",
    description: "Access complete SDK guides, webhook references, and prompt templates for custom agent integration.",
    icon: <BookOpen className="w-4 h-4 text-primary" />,
  },
  {
    title: "Brand Safety & Security Guard",
    description: "Isolated pgvector RAG schemas and strict compliance guardrails ensuring brand tone integrity.",
    icon: <ShieldCheck className="w-4 h-4 text-primary" />,
  }
];

export const TrustFeatures = () => {
  return (
    <div className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-none border border-border bg-card flex gap-4 transition-none"
            >
              <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-foreground mb-2 tracking-wide">
                  {feature.title}
                </h4>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
