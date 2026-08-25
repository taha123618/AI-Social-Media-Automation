"use client";

import { Bot, Zap, MessageSquare, BarChart3, Globe, Shield } from "lucide-react";
import React from "react";

const features = [
  {
    title: "AI Blog Writer",
    description: "Compose SEO-optimized blog posts that rank. Autonomous research, structure, and tone alignment.",
    icon: <Bot className="w-5 h-5 text-primary" />,
  },
  {
    title: "Social Media Engine",
    description: "Generate 30 days of high-conversion social content. Optimized for X, LinkedIn, and Instagram.",
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
  },
  {
    title: "Ad Campaign Dispatcher",
    description: "Create high-converting ad copy for Meta, Google, and TikTok with automated conversion tracking.",
    icon: <Zap className="w-5 h-5 text-primary" />,
  },
  {
    title: "Neuro-Analytics Telemetry",
    description: "Real-time engagement forecasting and consistency attribution metrics across social channels.",
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
  },
  {
    title: "Multi-Location Engine",
    description: "Localize content and regional voice profiles across multiple global storefronts with cultural context.",
    icon: <Globe className="w-5 h-5 text-primary" />,
  },
  {
    title: "Brand Voice Guard",
    description: "Continuous RAG embedding verification ensuring all AI outputs comply with brand safety protocols.",
    icon: <Shield className="w-5 h-5 text-primary" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-background border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            CORE CAPABILITIES
          </p>
          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground tracking-tight">
            ONE OPERATING SYSTEM // <span className="text-primary">INFINITE GROWTH</span>
          </h2>
          <p className="text-xs font-mono text-muted-foreground max-w-xl mx-auto mt-2">
            Replace fragmented SaaS subscriptions with a single unified AI marketing automation console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-5 rounded-none border border-border bg-card hover:border-primary/60 transition-none"
            >
              <div className="w-9 h-9 rounded-none bg-secondary border border-border flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-foreground mb-2 tracking-wider">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
