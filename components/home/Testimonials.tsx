"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import React from "react";

const reviews = [
  {
    name: "Alex Rivera",
    role: "Founder, Bloom Digital Fleet",
    content: "SocialAI reduced our organic production time by 80%. We manage 2x client rosters with deterministic tone safety.",
    avatar: "AR",
    stars: 5,
  },
  {
    name: "Sarah Chen",
    role: "E-comm Growth Operator",
    content: "The multi-agent workflow is astonishing. Our topical authority rankings rose significantly in under 3 weeks.",
    avatar: "SC",
    stars: 5,
  },
  {
    name: "Marcus Thorne",
    role: "VP Marketing, TechFlow Cloud",
    content: "Brand safety was our biggest concern with AI generation. SocialAI's pgvector guardrails are unmatched in precision.",
    avatar: "MT",
    stars: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Content Ops",
    content: "Finally, an autonomous engine that genuinely replicates our brand voice without generic LLM platitudes.",
    avatar: "ER",
    stars: 5,
  },
  {
    name: "David Park",
    role: "Principal Growth Engineer",
    content: "The analytics attribution breakdowns are comprehensive. We can pinpoint conversion ROI for every article vector.",
    avatar: "DP",
    stars: 5,
  },
];

function TestimonialCard({ review }: { review: typeof reviews[0] }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-[300px] shrink-0 p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col justify-between shadow-xs"
    >
      <div>
        {/* Quote icon */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-0.5">
            {[...Array(review.stars)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <Quote className="w-4 h-4 text-primary/30" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          &ldquo;{review.content}&rdquo;
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-border/60 pt-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary shrink-0">
          {review.avatar}
        </div>
        <div className="text-left min-w-0">
          <div className="text-xs font-bold text-foreground truncate">{review.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{review.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 text-center mb-14 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            VERIFIED SOCIAL PROOF
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Trusted by Growth Operators &amp; <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Modern Marketing Fleets
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Join 25,000+ creators, agencies, and enterprise teams who&apos;ve eliminated manual content production.
          </p>
        </motion.div>
      </div>

      {/* Scrollable testimonials strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 no-scrollbar max-w-6xl mx-auto">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <TestimonialCard review={review} />
          </motion.div>
        ))}
      </div>

      {/* Stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-14 border-t border-border/60 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto px-4 text-center"
      >
        {[
          { value: "25K+", label: "Active Workspaces" },
          { value: "148M+", label: "Posts Dispatched" },
          { value: "99.9%", label: "Uptime SLA" },
          { value: "4.8×", label: "Avg. ROAS Uplift" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-mono font-extrabold text-foreground tracking-tight mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
