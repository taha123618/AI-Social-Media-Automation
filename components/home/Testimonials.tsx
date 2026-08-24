"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { Star } from "lucide-react";
import React from "react";

const reviews = [
  {
    name: "Alex Rivera",
    role: "Founder, Bloom Digital",
    content: "SocialAI reduced our content production time by 80%. We're managing 2x more clients without hiring.",
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "E-comm Creator",
    content: "The viral hook engine is scary good. My last TikTok got 1.2M views using a SocialAI script.",
    avatar: "SC",
  },
  {
    name: "Marcus Thorne",
    role: "VP Marketing, TechFlow",
    content: "Brand safety was our biggest concern with AI. SocialAI's guardrails are the best in the market.",
    avatar: "MT",
  },
  {
    name: "Elena Rodriguez",
    role: "Social Media Lead",
    content: "Finally, an AI that actually sounds like my brand. The voice training is a game changer.",
    avatar: "ER",
  },
  {
    name: "David Park",
    role: "Growth Hacker",
    content: "The analytics breakdown is deep. I finally understand WHY my posts are performing well.",
    avatar: "DP",
  },
  {
    name: "Julia Smith",
    role: "Lifestyle Influencer",
    content: "It's like having a 24/7 creative assistant. I never run out of ideas anymore.",
    avatar: "JS",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors">
      <div className="container mx-auto px-4 text-center mb-16">
        <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Wall of Love</span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6 tracking-tight">
          Trusted by <span className="text-[#2D46FF] dark:text-blue-500">thousands</span> of creators
        </h2>
      </div>

      <div className="flex gap-8 whitespace-nowrap animate-scroll-x hover:[animation-play-state:paused] transition-all">
        {[...reviews, ...reviews].map((review, index) => (
          <div
            key={index}
            className="w-[400px] shrink-0 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm dark:shadow-none flex flex-col gap-6"
          >
            <div className="flex gap-1 text-yellow-400 dark:text-yellow-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed whitespace-normal italic">
              "{review.content}"
            </p>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-10 h-10 rounded-full bg-[#2D46FF] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                {review.avatar}
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-slate-950 dark:text-white">{review.name}</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{review.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
