"use client";

import { Plus, Minus } from "lucide-react";
import React, { useState } from "react";

const faqs = [
  {
    question: "How does the autonomous multi-agent pipeline work?",
    answer: "Mastra AI agents orchestrate specialized sub-tasks including market research, brand tone adherence, hook generation, and BullMQ worker scheduling.",
  },
  {
    question: "Which social media platforms and CMS endpoints are supported?",
    answer: "We support LinkedIn, X (Twitter), Instagram, TikTok, YouTube Shorts, Threads, Pinterest, and direct CMS webhook publishing (WordPress, Medium, Webflow).",
  },
  {
    question: "How are brand safety and data privacy guaranteed?",
    answer: "We store brand context in isolated PostgreSQL + pgvector schemas with strict multi-tenancy filters on every query. Your proprietary brand data is never shared across tenants.",
  },
  {
    question: "Can I invite team members and assign role-based permissions?",
    answer: "Yes. Our Pro and Enterprise tiers include role-based access control (OWNER, ADMIN, EDITOR, VIEWER) with audit trail logging for all actions.",
  },
  {
    question: "What occurs when monthly plan quotas are reached?",
    answer: "The platform provides real-time quota telemetry and seamless 1-click upgrades or on-demand generation credits without workflow interruption.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            TECHNICAL DIRECTIVES
          </p>
          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-none border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-secondary/60 transition-none"
              >
                <span className="text-xs md:text-sm font-mono font-bold uppercase text-foreground pr-4">
                  {faq.question}
                </span>
                <div className="w-6 h-6 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0 text-primary">
                  {openIndex === index ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-5 pb-4 pt-1 border-t border-border bg-secondary/20">
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
