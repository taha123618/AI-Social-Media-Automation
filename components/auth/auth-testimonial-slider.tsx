"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "SocialAI completely transformed our content cadence. The 13-agent fleet generates, optimizes, and schedules weeks of cross-platform campaigns in minutes. 🚀",
    name: "Csaba Kissi",
    handle: "@csaba_kissi",
    role: "Head of Growth",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: 2,
    quote: "Our cross-channel engagement doubled within the first month. The autonomous brand voice adaptation across LinkedIn and X is shockingly accurate.",
    name: "KingsMen",
    handle: "@KingsmenSigma",
    role: "Digital Strategist",
    avatar: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&h=120&fit=crop",
  },
  {
    id: 3,
    quote: "The multi-platform scheduler and AI Blog Writer cut 20+ hours of manual content production every week. Absolute must-have for scaling marketing teams.",
    name: "Alex Rivera",
    handle: "@alex_rivera_ui",
    role: "Content Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: 4,
    quote: "Autonomous trend intelligence + seamless multi-channel auto-publishing. SocialAI handles our entire social fleet with zero friction.",
    name: "Sarah Chen",
    handle: "@sarahc_dev",
    role: "SaaS Founder",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: 5,
    quote: "From automated DM responses to YouTube video transcription and repurposing, this platform replaced four disparate tools for our agency.",
    name: "Marcus Vance",
    handle: "@marcus_vance",
    role: "Agency Principal",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: 6,
    quote: "Enterprise-grade reliability with pgvector semantic search. The content quality consistently beats human agency drafts.",
    name: "Elena Rostova",
    handle: "@elena_builds",
    role: "VP Marketing",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face",
  },
];

export function AuthTestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const active = TESTIMONIALS[currentIndex];

  return (
    <div
      className="w-full max-w-xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial Card Container with Outer Prev/Next Arrows */}
      <div className="relative px-5 sm:px-6">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous testimonial"
          className="absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#181822]/90 hover:bg-[#222230] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl cursor-pointer z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* The Card */}
        <div className="bg-[#12121A]/95 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md min-h-[170px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col justify-between h-full"
            >
              <p className="text-white text-base sm:text-[16px] font-medium leading-relaxed mb-6">
                &ldquo;{active.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Image
                    src={active.avatar}
                    alt={active.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full object-cover border border-white/15 bg-white/5"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {active.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                      {active.role} • {active.handle}
                    </p>
                  </div>
                </div>

                {/* 5 Yellow Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 stroke-amber-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next testimonial"
          className="absolute -right-1 sm:-right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#181822]/90 hover:bg-[#222230] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl cursor-pointer z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {TESTIMONIALS.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? "w-7 bg-primary shadow-xs"
                : "w-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
