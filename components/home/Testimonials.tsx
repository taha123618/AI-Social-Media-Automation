"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import React from "react";

const reviews = [
  {
    name: "Alex Rivera",
    role: "Founder, Bloom Digital Fleet",
    content: "SocialAI reduced our organic production time by 80%. We manage 2x client rosters with deterministic tone safety.",
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "E-comm Growth Operator",
    content: "The multi-agent workflow is astonishing. Our topical authority rankings rose significantly in under 3 weeks.",
    avatar: "SC",
  },
  {
    name: "Marcus Thorne",
    role: "VP Marketing, TechFlow Cloud",
    content: "Brand safety was our biggest concern with AI generation. SocialAI's pgvector guardrails are unmatched in precision.",
    avatar: "MT",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Content Ops",
    content: "Finally, an autonomous engine that genuinely replicates our brand voice without generic LLM platitudes.",
    avatar: "ER",
  },
  {
    name: "David Park",
    role: "Principal Growth Engineer",
    content: "The analytics attribution breakdowns are comprehensive. We can pinpoint conversion ROI for every article vector.",
    avatar: "DP",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            VERIFIED SOCIAL PROOF
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Trusted by Growth Operators & <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Modern Marketing Fleets
            </span>
          </h2>
        </motion.div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 px-4 no-scrollbar max-w-6xl mx-auto">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="w-[300px] shrink-0 p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic mb-4">
                &ldquo;{review.content}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-border/60 pt-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary">
                {review.avatar}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">{review.name}</div>
                <div className="text-[10px] text-muted-foreground">{review.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
