"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, TrendingUp, ShoppingBag, Code2, Stethoscope, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

const EXAMPLES = [
  {
    category: "SaaS / Tech",
    icon: Code2,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    keyword: "project management software for remote teams",
    title: "15 Best Project Management Tools for Remote Teams in 2025",
    wordCount: 4200,
    seoScore: 96,
    readability: "Grade 9",
    excerpt:
      "Remote work has fundamentally changed how teams collaborate — and your project management software needs to keep up. Whether you're coordinating a 5-person startup or a 500-person enterprise, the right tool can be the difference between chaos and clockwork efficiency. In this comprehensive guide, we've tested 15 leading platforms so you can make the smartest decision for your team...",
    tags: ["How-to", "Listicle", "Commercial Intent"],
  },
  {
    category: "E-commerce",
    icon: ShoppingBag,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    keyword: "best noise cancelling headphones under $200",
    title: "Best Noise-Cancelling Headphones Under $200 (2025 Buyer's Guide)",
    wordCount: 3800,
    seoScore: 94,
    readability: "Grade 8",
    excerpt:
      "You don't need to spend $400 on Sony XM5s or AirPods Max to get exceptional noise cancellation. The sub-$200 market has exploded in 2025, with brands like Anker, JBL, and Jabra delivering ANC that would've cost twice as much just two years ago. After 60+ hours of real-world testing, we've narrowed it down to the 7 headphones worth your money...",
    tags: ["Buyer's Guide", "Review", "Comparison"],
  },
  {
    category: "Health & Wellness",
    icon: Stethoscope,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    keyword: "intermittent fasting for beginners",
    title: "Intermittent Fasting for Beginners: The Complete 2025 Guide",
    wordCount: 5600,
    seoScore: 92,
    readability: "Grade 7",
    excerpt:
      "Intermittent fasting (IF) isn't a diet — it's a pattern of eating that can help you lose weight, improve metabolic health, and even extend lifespan. The science is compelling, the approach is flexible, and thousands of people are having life-changing results. But where do you start? This guide covers everything: the 5 most popular IF protocols, who it works for, and a week-by-week beginner plan...",
    tags: ["Pillar Content", "Informational", "E-E-A-T"],
  },
  {
    category: "Finance",
    icon: DollarSign,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    keyword: "how to build an emergency fund",
    title: "How to Build an Emergency Fund From Zero (Even on a Tight Budget)",
    wordCount: 2900,
    seoScore: 97,
    readability: "Grade 8",
    excerpt:
      "Financial emergencies don't wait for a convenient time. A car repair, medical bill, or sudden job loss can derail years of financial progress if you're not prepared. Building an emergency fund is the single most impactful step you can take toward financial stability — and you don't need to start with thousands of dollars. Here's a realistic, step-by-step approach that works even when money is tight...",
    tags: ["How-to", "Informational", "Featured Snippet"],
  },
  {
    category: "Education",
    icon: BookOpen,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    keyword: "learn python for data science",
    title: "Learn Python for Data Science: The 2025 Roadmap for Beginners",
    wordCount: 6100,
    seoScore: 93,
    readability: "Grade 10",
    excerpt:
      "Python has become the undisputed language of data science, machine learning, and AI. But learning it can feel overwhelming without a structured path. Should you start with NumPy or Pandas? When do you need to learn machine learning? This roadmap cuts through the noise and gives you a clear, week-by-week curriculum to go from zero to job-ready in 6 months...",
    tags: ["Pillar Content", "Tutorial", "High Intent"],
  },
  {
    category: "Marketing",
    icon: TrendingUp,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    keyword: "email marketing best practices 2025",
    title: "Email Marketing Best Practices in 2025: What Actually Works Now",
    wordCount: 3400,
    seoScore: 95,
    readability: "Grade 9",
    excerpt:
      "Email marketing has changed dramatically. The tactics that drove 40% open rates in 2020 are now landing you in the promotions tab — or worse, spam. In 2025, success requires mastering AI-powered personalization, interactive email elements, and Apple's Mail Privacy Protection. This guide shares the 12 practices that elite senders are using right now to consistently beat industry benchmarks...",
    tags: ["Best Practices", "Commercial Intent", "Actionable"],
  },
];

export default function BlogExamples() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section id="examples" className="relative py-32 bg-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
           <div className="h-96 w-full bg-card/50 rounded-3xl animate-pulse" />
        </div>
      </section>
    );
  }

  const example = EXAMPLES[active];
  const Icon = example.icon;

  const prev = () => setActive((p) => (p === 0 ? EXAMPLES.length - 1 : p - 1));
  const next = () => setActive((p) => (p === EXAMPLES.length - 1 ? 0 : p + 1));

  return (
    <section id="examples" className="relative py-32 bg-background overflow-hidden">
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none dark:bg-primary/5" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 mb-6">
            <BookOpen className="h-4 w-4" />
            Real Output Examples
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            See what our AI{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              actually produces
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Real articles generated by our AI for real industries. Not cherry-picked — these are
            standard outputs from everyday users.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {EXAMPLES.map((ex, i) => {
            const TabIcon = ex.icon;
            return (
              <button
                key={ex.category}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  active === i
                    ? `${ex.bg} ${ex.color} border-current`
                  : "border-border text-muted-foreground bg-card/50 hover:bg-card/80"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                {ex.category}
              </button>
            );
          })}
        </div>

        {/* Article preview card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl border border-border bg-card overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center gap-4 px-8 py-5 border-b border-border bg-card/50">
              <div className={`p-2.5 rounded-xl border ${example.bg}`}>
                <Icon className={`h-5 w-5 ${example.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Target keyword
                </p>
                <p className="text-sm font-mono text-blue-400 truncate">{example.keyword}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                {[
                  { label: "Words", val: example.wordCount.toLocaleString() },
                  { label: "SEO", val: `${example.seoScore}/100` },
                  { label: "Readability", val: example.readability },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold text-foreground">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Article body */}
            <div className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-black text-foreground mb-6 leading-snug">
                {example.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-8">
                {example.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${example.bg} ${example.color}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Faded continuation */}
              <div className="relative h-16 -mt-2">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  ...continuing with 10 more sections including a comparison table, expert quotes, FAQ, and a final verdict with affiliate links automatically placed...
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-8 pb-6">
              <button
                onClick={prev}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <div className="flex gap-1.5">
                {EXAMPLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? `w-8 ${example.color.replace("text-", "bg-")}` : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
