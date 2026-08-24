"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, ChevronRight, ChevronLeft, Star } from "lucide-react";

const EXAMPLES = [
  {
    category: "SEO Article",
    title: "10 Proven SEO Strategies for 2026",
    excerpt:
      "Discover the latest SEO strategies that top marketers are using to dominate search rankings in 2026. From AI-powered content clusters to entity-based optimization.",
    score: 96,
    words: 3200,
    readTime: 12,
    tags: ["SEO", "Marketing", "Strategy"],
  },
  {
    category: "How-To Guide",
    title: "How to Start a Successful Blog in 2026",
    excerpt:
      "A complete step-by-step guide to launching a profitable blog. From niche selection to monetization, everything you need to know.",
    score: 94,
    words: 4500,
    readTime: 16,
    tags: ["Blogging", "Guide", "Beginner"],
  },
  {
    category: "Listicle",
    title: "15 AI Tools Every Marketer Needs in 2026",
    excerpt:
      "We tested 200+ AI tools to bring you the definitive list of must-have AI marketing tools for content creation, analytics, and automation.",
    score: 91,
    words: 2800,
    readTime: 10,
    tags: ["AI", "Tools", "Marketing"],
  },
  {
    category: "Case Study",
    title: "How We Grept Organic Traffic by 847%",
    excerpt:
      "A deep dive into our content strategy overhaul that resulted in an 847% organic traffic increase in just 6 months using AI-powered content.",
    score: 98,
    words: 5100,
    readTime: 18,
    tags: ["Case Study", "Growth", "Results"],
  },
];

export default function Examples() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  const navigate = (dir: number) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + EXAMPLES.length) % EXAMPLES.length);
  };

  const example = EXAMPLES[activeIndex];

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-400 mb-6">
            <FileText className="h-4 w-4" />
            See It in Action
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Real content,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              generated in seconds
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Browse through sample articles created entirely by our AI.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.category}
                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {ex.category}
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="p-8 rounded-3xl border border-border bg-card/50"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{example.category}</span>
                    <h3 className="text-2xl font-black text-foreground mt-2">{example.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    <Star className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                    <span className="text-sm font-black text-emerald-400">{example.score}</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">{example.excerpt}</p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {example.tags.map((tag) => (
                    <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">{example.words.toLocaleString()} words</span>
                  <span className="text-xs text-muted-foreground">{example.readTime} min read</span>
                </div>

                {/* Mock content preview */}
                <div className="space-y-2 opacity-50">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-11/12 rounded bg-muted" />
                  <div className="h-3 w-4/5 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-muted border border-border hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {EXAMPLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => navigate(1)}
                className="p-2 rounded-xl bg-muted border border-border hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
