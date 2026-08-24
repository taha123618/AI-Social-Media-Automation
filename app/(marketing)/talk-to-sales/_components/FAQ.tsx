"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What happens during the demo?",
    answer:
      "Our 30-minute session includes a personalized walkthrough of SocialAI's key features relevant to your use case. We'll cover content creation, scheduling, analytics, and team collaboration — followed by a Q&A. You'll see real examples of how teams like yours achieve results.",
  },
  {
    question: "Who should attend the demo?",
    answer:
      "We recommend including decision-makers from marketing, content, and social teams. The more context we have about your workflows, the more tailored the demo will be. Typically, marketing directors, social media managers, and CMOs attend.",
  },
  {
    question: "Do I need to prepare anything?",
    answer:
      "No preparation needed. Just bring your questions and any specific challenges you're facing with your current social media workflow. If you have existing content or brand guidelines you'd like us to reference, feel free to share those during the session.",
  },
  {
    question: "Is there a free trial after the demo?",
    answer:
      "Yes. After your demo, we'll set up a free trial tailored to your team size and use case. You'll get full access to all features, with onboarding support from our team to ensure you get the most value.",
  },
  {
    question: "Can I bring my team members?",
    answer:
      "Absolutely. We encourage you to invite team members who would be using the platform. Multiple attendees give us a better understanding of your collaboration needs and ensure everyone's questions are answered.",
  },
  {
    question: "What if I need to reschedule?",
    answer:
      "No problem. You'll receive a calendar confirmation with rescheduling options. You can also email us at sales@socialai.com and we'll help find a new time that works for your team.",
  },
  {
    question: "How soon can we get started after the demo?",
    answer:
      "Most teams start their free trial within 24 hours of the demo. If you're ready to move forward, we can have your workspace set up with your team members invited before the demo session ends.",
  },
  {
    question: "Is there a commitment required to book a demo?",
    answer:
      "No commitment at all. The demo is entirely obligation-free. We're here to show you the platform and answer your questions — no sales pressure, no hidden terms.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" />
            Questions?
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[8px] border border-border bg-card overflow-hidden"
            >
              <h3>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-trigger-${index}`}
                >
                  <span className="text-sm sm:text-base font-bold text-foreground pr-6">{faq.question}</span>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 text-foreground" />
                    ) : (
                      <Plus className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                </button>
              </h3>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    key={`answer-${index}`}
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-sm text-muted-foreground font-medium leading-relaxed">
                      {faq.answer}
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
