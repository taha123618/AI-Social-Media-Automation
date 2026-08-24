"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How does the AI generate SEO-optimized content?",
    a: "Our AI analyzes top-ranking content for your target keywords, identifies semantic entities and LSI keywords, then structures the article with proper heading hierarchy, keyword placement, readability optimization, and internal linking opportunities — all before generating a single sentence.",
  },
  {
    q: "Can I trust the content to pass AI detection tools?",
    a: "Yes. Our proprietary humanization engine applies 14+ linguistic techniques including sentence rhythm variation, colloquial insertions, structural unpredictability, and contextual entity placement to produce content that consistently passes Originality.ai, GPTZero, and Turnitin.",
  },
  {
    q: "How long does it take to generate an article?",
    a: "A 2,500-word article is typically generated in under 60 seconds. Including outline review and SEO optimization, the full workflow from keyword to publish-ready article takes approximately 10 minutes.",
  },
  {
    q: "Can I customize the tone and brand voice?",
    a: "Absolutely. You can choose from 10 built-in tones (Professional, Conversational, Academic, etc.) or train the AI on your existing content to match your brand voice with 95%+ accuracy.",
  },
  {
    q: "What languages do you support?",
    a: "We support 40+ languages with native-level fluency. The AI understands cultural context, regional expressions, and locale-specific SEO requirements for each language.",
  },
  {
    q: "Can I publish directly to my CMS?",
    a: "Yes. One-click publishing is available for WordPress, Webflow, Shopify, Ghost, and Notion. Schema markup, Open Graph tags, and featured image prompts are auto-generated on export.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 mb-6">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Got questions?{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              We&apos;ve got answers.
            </span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left bg-card/30 hover:bg-card/50 transition-colors"
              >
                <span className="font-bold text-foreground pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
