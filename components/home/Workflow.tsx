"use client";

import { Rocket, Sparkles, Send, TrendingUp } from "lucide-react";

const steps = [
  {
    title: "1. Define Objectives & Audience",
    description: "Specify conversion targets, target personas, and voice guidelines within your business profile.",
    icon: <Rocket className="w-5 h-5 text-primary" />,
  },
  {
    title: "2. Autonomous RAG Synthesis",
    description: "Mastra multi-agent workflows extract brand context, trending patterns, and verified domain knowledge.",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
  },
  {
    title: "3. Multi-Network Batch Generation",
    description: "Generate synchronized campaign drafts for LinkedIn, X, Meta, Instagram, and Blog CMS simultaneously.",
    icon: <Send className="w-5 h-5 text-primary" />,
  },
  {
    title: "4. Telemetry & Revenue Attribution",
    description: "Automated BullMQ worker dispatch, real-time engagement ingestion, and CRM revenue attribution.",
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
  },
];

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="py-20 px-4 bg-secondary/30 border-y border-border"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            PIPELINE ARCHITECTURE
          </p>
          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground tracking-tight">
            FOUR PHASES // <span className="text-primary">ZERO LATENCY DISPATCH</span>
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-2">
            Deterministic orchestration from raw strategic intent to verified multi-channel publishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-5 border border-border bg-card rounded-none relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-none bg-secondary border border-border flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-secondary text-primary border border-border">
                    STEP 0{index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-foreground mb-2 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
