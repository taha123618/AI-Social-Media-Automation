"use client";

import { User, Users, Building2 } from "lucide-react";
import React from "react";

const personas = [
  {
    title: "Solo Operators & Creators",
    description: "Scale a high-impact personal brand across multiple channels with zero manual copywriting overhead.",
    icon: <User className="w-5 h-5 text-primary" />,
    stats: "+240% REACH",
    benefits: ["Autonomous Hook Synthesis", "Cross-Platform Sync", "Voice Guard Tuning"],
  },
  {
    title: "Agencies & Consultancies",
    description: "Manage 50+ multi-tenant client workspaces with isolated brand profiles and centralized billing seats.",
    icon: <Users className="w-5 h-5 text-primary" />,
    stats: "5X EFFICIENCY",
    benefits: ["Client Approval Flow", "Bulk Campaign Dispatch", "Attribution Dashboards"],
  },
  {
    title: "Enterprise Multi-Location",
    description: "Coordinate hundreds of franchise storefronts with strictly enforced brand safety and local RAG context.",
    icon: <Building2 className="w-5 h-5 text-primary" />,
    stats: "99.9% CONSISTENCY",
    benefits: ["pgvector RAG Isolation", "Location-Aware Scheduling", "SSO & Role Matrix"],
  },
];

export default function UseCases() {
  return (
    <section id="solutions" className="py-20 bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            DEPLOYMENT PROFILES
          </p>
          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground mb-3 tracking-tight">
            TAILORED FOR HIGH-VELOCITY TEAMS
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            From single-operator workflows to distributed multi-location enterprise brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="p-6 rounded-none border border-border bg-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-none bg-secondary border border-border flex items-center justify-center">
                    {persona.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/30">
                    {persona.stats}
                  </span>
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-foreground mb-2 tracking-wide">
                  {persona.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-6">
                  {persona.description}
                </p>
              </div>

              <ul className="space-y-2 border-t border-border pt-4">
                {persona.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-mono text-foreground">
                    <span className="text-primary font-bold">›</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
