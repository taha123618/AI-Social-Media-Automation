"use client";

import { Star } from "lucide-react";
import React from "react";

const reviews = [
  {
    name: "Alex Rivera",
    role: "Founder, Bloom Digital",
    content: "Reduced our multi-client content production latency by 80%. We're managing 2x more accounts with zero team overhead.",
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "Growth Engineer",
    content: "The viral hook synthesizer is exceptionally accurate. Our pipeline conversion jumped 3.4x in the first 30 days.",
    avatar: "SC",
  },
  {
    name: "Marcus Thorne",
    role: "VP Marketing, TechFlow",
    content: "Brand safety was our primary constraint. The pgvector RAG guardrails reliably prevent hallucinated messaging.",
    avatar: "MT",
  },
  {
    name: "Elena Rodriguez",
    role: "Social Media Lead",
    content: "Deterministic voice profiling gives us identical tone across X, LinkedIn, and our technical blog CMS.",
    avatar: "ER",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 text-center mb-12 max-w-6xl">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
          OPERATIONAL FEEDBACK
        </p>
        <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground tracking-tight">
          VERIFIED OPERATOR EXPERIENCES
        </h2>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="p-5 rounded-none border border-border bg-card flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-primary mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed italic mb-4">
                  "{review.content}"
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-border pt-3">
                <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary text-xs font-mono font-bold">
                  {review.avatar}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-mono font-bold text-foreground truncate">{review.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
