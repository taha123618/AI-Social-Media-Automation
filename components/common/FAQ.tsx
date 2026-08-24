"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import React, { useState } from "react";

const faqs = [
  {
    question: "Do I need to be a prompted expert to use SocialAI?",
    answer: "Not at all. SocialAI handles the technical prompting behind the scenes. You just describe your idea in natural language, and our engine takes care of the rest.",
  },
  {
    question: "Which social media platforms do you support?",
    answer: "We currently support Instagram, Twitter (X), LinkedIn, TikTok, YouTube, Threads, and Pinterest. We're constantly adding new integrations based on user demand.",
  },
  {
    question: "Is the content generated truly unique?",
    answer: "Yes. Every post is generated from scratch based on your specific requirements and brand DNA. We don't use templates, ensuring your content stands out from the crowd.",
  },
  {
    question: "Can I use SocialAI for my team or agency?",
    answer: "Absolutely. Our Agency and Enterprise plans include dedicated features for team collaboration, client approval flows, and multi-account management.",
  },
  {
    question: "What happens if I reach my monthly post limit?",
    answer: "You'll receive a notification when you're close to your limit. You can easily upgrade your plan at any time or purchase additional content credits on the fly.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-slate-50 dark:bg-slate-950 relative transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Questions</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6 tracking-tight">
            Frequently asked <span className="text-[#2D46FF] dark:text-blue-500">questions.</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="text-lg font-black text-slate-950 dark:text-white pr-8">{faq.question}</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-slate-900 dark:text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-900 dark:text-white" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
