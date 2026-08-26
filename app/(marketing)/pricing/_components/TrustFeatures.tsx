"use client";

import { Headphones, CreditCard, BookOpen, Sparkles } from "lucide-react";

const trustFeatures = [
  {
    title: "Dedicated Operational Support",
    description: "Get prompt assistance from our platform engineering team. Priority and enterprise tiers include dedicated CSM support and Slack connect channels.",
    icon: <Headphones className="w-5 h-5 text-primary" />,
  },
  {
    title: "Flexible Quota Scaling",
    description: "Upgrade or scale your dispatch volume on demand. Pay only for the active workspace seats and generation units your fleet utilizes.",
    icon: <CreditCard className="w-5 h-5 text-accent" />,
  },
  {
    title: "Developer API & Webhooks",
    description: "Integrate programmatic generation endpoints directly into your proprietary CMS, marketing automation, or CRM stack.",
    icon: <BookOpen className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "Deterministic Brand Guardrails",
    description: "Eliminate hallucinations using multi-tenant pgvector RAG embeddings that enforce your tone of voice across every generated article.",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
  }
];

export const TrustFeatures = () => {
  return (
    <div className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/80 bg-card flex gap-4 hover:border-primary/40 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
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
