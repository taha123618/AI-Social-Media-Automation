"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import React, { useState } from "react";

const faqs = [
  {
    question: "How do Mastra autonomous AI agents operate across channels?",
    answer: "Our engine orchestrates 13 specialized Mastra agents. One agent conducts topical research, another formats the article with Gutenberg HTML serialization, while social agents schedule optimized variants across LinkedIn, X, and Instagram.",
  },
  {
    question: "Which social networks and CMS platforms are supported natively?",
    answer: "We support direct 1-click publishing and scheduling for LinkedIn, X (Twitter), Instagram, TikTok, YouTube, Threads, as well as WordPress, Ghost, Webflow, and Shopify.",
  },
  {
    question: "How does Brand Voice isolation prevent hallucinations?",
    answer: "We use pgvector embeddings with multi-tenant workspace scoping. Your brand tone, style guidelines, and approved reference materials are retrieved dynamically via RAG before any generation pass.",
  },
  {
    question: "Can I manage multiple client workspaces with team roles?",
    answer: "Yes. Our platform provides multi-tenant role-based access control (Admin, Editor, Viewer), client approval queues, and separated billing per organization.",
  },
  {
    question: "What happens when monthly quota generation limits are reached?",
    answer: "You receive proactive in-app quota alerts. You can upgrade with 1 click to the next tier or purchase add-on consumption packs without interrupting active schedules.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            KNOWLEDGE BASE
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Everything you need to know about autonomous social automation and multi-agent workflows.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/80 bg-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-muted/40"
              >
                <span className="text-sm md:text-base font-semibold text-foreground pr-4">{faq.question}</span>
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
