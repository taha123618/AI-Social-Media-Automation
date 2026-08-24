"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const stats = [
  { value: "24,700+", label: "Active Users" },
  { value: "100+", label: "Enterprise Brands" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "99.9%", label: "Uptime SLA" },
];

const testimonials = [
  {
    quote:
      "SocialAI transformed our social media workflow. We went from 10 hours a week to under 2 hours of manual work. The demo sold us immediately.",
    author: "Sarah Chen",
    role: "Head of Marketing, TechFlow",
    rating: 5,
  },
  {
    quote:
      "The personalized demo showed us exactly how their platform would handle our multi-location agency needs. We signed up before the call ended.",
    author: "Marcus Johnson",
    role: "CEO, Digital Rise Agency",
    rating: 5,
  },
  {
    quote:
      "We evaluated six platforms. SocialAI's AI-powered analytics and brand voice training set them apart. The demo made the decision easy.",
    author: "Emily Rodriguez",
    role: "Director of Content, GrowthLab",
    rating: 5,
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-[8px] border border-border bg-card shadow-sm"
            >
              <p className="text-3xl sm:text-4xl font-black text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm mb-6"
          >
            <Quote className="h-3 w-3" />
            Trusted by Teams
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground leading-[1.05]"
          >
            What Our Users{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Say
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-[8px] border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground font-medium leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-black text-primary">
                  {t.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["TechFlow", "Digital Rise", "GrowthLab", "ScaleUp", "BrandMax", "NexusMedia"].map((name) => (
              <div key={name} className="h-6 flex items-center">
                <span className="text-lg font-black text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors select-none">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
