/* eslint-disable @next/next/no-img-element, @next/next/no-page-custom-font */
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

interface FAQItem {
  readonly id: string;
  readonly number: string;
  readonly question: string;
  readonly answer: string;
  readonly image: string;
}

const FAQ_DATA: readonly FAQItem[] = [
  {
    id: "faq-1",
    number: "01",
    question: "How do autonomous AI agents operate across channels?",
    answer:
      "Our engine coordinates 13 specialized autonomous agents. One agent conducts real-time topical research, another formats the article with rich Gutenberg serialization, while dedicated social agents schedule and dispatch platform-optimized variants across LinkedIn, X, Instagram, and TikTok.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "faq-2",
    number: "02",
    question: "How does Brand Voice isolation prevent hallucinations?",
    answer:
      "We use pgvector embeddings with deterministic multi-tenant workspace scoping. Your brand tone, style guidelines, forbidden vocabulary, and approved reference assets are dynamically retrieved via RAG before any generation pass, guaranteeing 100% compliance.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "faq-3",
    number: "03",
    question: "Which social networks and CMS platforms are supported natively?",
    answer:
      "We support direct 1-click publishing and scheduling for LinkedIn, X (Twitter), Instagram, TikTok, YouTube Shorts, and Threads, as well as native CMS integrations for WordPress, Ghost, Webflow, and Shopify.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "faq-4",
    number: "04",
    question: "Can I manage multiple client workspaces with custom team roles?",
    answer:
      "Yes. Our platform provides enterprise multi-tenant role-based access control (Admin, Editor, Viewer), client approval queues, and separated billing per organization, making it seamless for growth agencies to manage multiple brand rosters.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "faq-5",
    number: "05",
    question: "What security, data privacy, and SLA guarantees are included?",
    answer:
      "Every enterprise workspace is backed by 99.9% uptime SLA, zero model training on customer data, automated SSRF validation, AES-256 encryption at rest, and 24/7 dedicated engineering support.",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  },
];

const HEADER_ANIMATION: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const ACCORDION_ITEM_ANIMATION: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: index * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const CONTENT_ANIMATION: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.35, delay: 0.1 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.2 },
    },
  },
};

function FAQComponent() {
  // Default: only one item open at a time; item 02 (index 1) open on mount
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const toggleAccordion = useCallback((index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  const items = useMemo(() => FAQ_DATA, []);

  return (
    <>
      {/* Scoped Google Fonts: Gilda Display & Geist */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Gilda+Display&display=swap"
        rel="stylesheet"
        crossOrigin="anonymous"
      />

      <style>{`
        [data-faq-gilda] {
          font-family: 'Gilda Display', Georgia, serif;
        }
        [data-faq-geist] {
          font-family: 'Geist', sans-serif;
        }
      `}</style>

      <section
        id="faq"
        className="relative w-full overflow-hidden select-none bg-background text-foreground py-20 lg:py-28 px-6 sm:px-12 lg:px-16 transition-colors duration-300"
      >
        {/* Subtle ambient mesh glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1472px] mx-auto flex flex-col gap-12 lg:gap-16 relative z-10">
          {/* 1. Header Row */}
          <motion.div
            variants={HEADER_ANIMATION}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-12"
          >
            {/* Left Block */}
            <div className="max-w-[640px] flex flex-col gap-4 lg:gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span data-faq-geist>FAQS</span>
              </div>
              <h2
                data-faq-gilda
                className="text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.15] lg:leading-[1.2] tracking-[-0.04em] text-foreground"
              >
                Clear Answers for Your{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
                  Autonomous Journey
                </span>
              </h2>
            </div>

            {/* Right Block */}
            <div className="max-w-[543px]">
              <p
                data-faq-geist
                className="text-base sm:text-lg lg:text-xl font-normal leading-[1.6] tracking-[-0.02em] text-muted-foreground"
              >
                From multi-agent marketing orchestration to enterprise brand safety
                and direct publishing integrations, explore answers to common inquiries.
              </p>
            </div>
          </motion.div>

          {/* 2. Accordion List */}
          <div className="flex flex-col border-b border-border/80">
            {items.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={ACCORDION_ITEM_ANIMATION}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.15 }}
                  className="border-t border-border/80 transition-colors duration-300"
                >
                  {/* Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    className={`w-full text-left cursor-pointer flex items-center justify-between transition-all duration-300 group ${
                      isOpen
                        ? "pt-7 sm:pt-8 lg:pt-9 pb-4 sm:pb-5"
                        : "py-7 sm:py-8 lg:py-9"
                    }`}
                  >
                    {/* Left Group (Number + Question) */}
                    <div className="flex items-baseline gap-6 sm:gap-10 lg:gap-14 flex-1 pr-4 min-w-0">
                      {/* Item Number */}
                      <span
                        data-faq-gilda
                        className={`text-2xl sm:text-3xl lg:text-4xl tracking-[-0.02em] shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "text-primary font-medium"
                            : "text-muted-foreground/60 group-hover:text-foreground"
                        }`}
                      >
                        {item.number}
                      </span>

                      {/* Question Title */}
                      <h3
                        data-faq-gilda
                        className={`transition-all duration-300 font-normal ${
                          isOpen
                            ? "text-[26px] sm:text-[36px] lg:text-[44px] leading-[1.2] text-foreground"
                            : "text-[20px] sm:text-[26px] lg:text-[32px] leading-[1.3] text-foreground/80 group-hover:text-foreground"
                        }`}
                      >
                        {item.question}
                      </h3>
                    </div>

                    {/* Circular Indicator */}
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs ${
                        isOpen
                          ? "bg-primary text-primary-foreground rotate-180 shadow-primary/20"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 group-hover:scale-105"
                      }`}
                    >
                      <ChevronDown
                        className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300"
                        strokeWidth={2.4}
                      />
                    </div>
                  </button>

                  {/* Expandable Content with Capsule Image Preview */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        variants={CONTENT_ANIMATION}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="pl-10 sm:pl-16 lg:pl-20 pr-2 pt-2 pb-8 sm:pb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 lg:gap-12">
                          {/* Answer Paragraph */}
                          <p
                            data-faq-geist
                            className="text-sm sm:text-base lg:text-lg font-normal leading-[1.75] text-muted-foreground max-w-[700px]"
                          >
                            {item.answer}
                          </p>

                          {/* Signature Capsule Image Preview */}
                          <div className="relative w-full sm:w-[260px] md:w-[280px] lg:w-[320px] h-[90px] sm:h-[100px] lg:h-[110px] rounded-full overflow-hidden shrink-0 border border-border/80 shadow-md bg-secondary group/pill">
                            <img
                              src={item.image}
                              alt={item.question}
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/pill:scale-108"
                            />
                            {/* Subtle tint overlay */}
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default React.memo(FAQComponent);
