/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  readonly id: number;
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly avatar: string;
  readonly opacity: number;
}

const STATIC_TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 1,
    quote:
      "SocialAI gave us a deterministic roadmap to scale multi-channel content without burning out our creative fleet.",
    name: "Jason Lee",
    role: "Startup Founder, Velocity",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
  {
    id: 2,
    quote:
      "The 13-agent engine simplified our entire distribution strategy. Within weeks, we doubled our organic inbound pipeline.",
    name: "Sarah Chen",
    role: "Growth Director, Bloom",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
  {
    id: 3,
    quote:
      "We automated carousel generation and LinkedIn scheduling across 8 client accounts with flawless brand voice adherence.",
    name: "Danielle Brooke",
    role: "Agency Principal, Studio 7",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
  {
    id: 4,
    quote:
      "The pgvector brand voice guardrails prevent AI hallucinations. Our output scaled 4x while maintaining strict compliance.",
    name: "Laura Chen",
    role: "Head of Content, Aura",
    avatar:
      "https://images.unsplash.com/photo-1534751516642-a1714f5a5467?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
  {
    id: 5,
    quote:
      "SocialAI's analytics attribution is unmatched. We can pinpoint direct customer conversion ROI for every social post.",
    name: "Michael Adams",
    role: "SaaS Founder, DataMesh",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
  {
    id: 6,
    quote:
      "Cutting 30+ hours of manual writing every week gave our marketing fleet the speed to consistently outperform competitors.",
    name: "Amina Patel",
    role: "Demand Gen Lead, Orbit",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    opacity: 0.35,
  },
];

const TestimonialCard = React.memo(function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <div
      className="bg-card/85 dark:bg-card/75 border border-border/80 text-card-foreground rounded-2xl p-6 shadow-xs flex flex-col w-[340px] sm:w-[360px] shrink-0 transition-colors duration-300"
      style={{ opacity: testimonial.opacity }}
    >
      <div className="text-primary text-2xl font-bold font-mono mb-3 leading-none select-none">
        {String.fromCharCode(10077)}
        {String.fromCharCode(10077)}
      </div>
      <p className="text-muted-foreground text-xs sm:text-[13px] leading-relaxed mb-5 flex-grow line-clamp-3">
        {testimonial.quote}
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-10 h-10 rounded-xl object-cover border border-border/60 shadow-2xs"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <div className="text-foreground text-xs font-bold leading-tight truncate">
            {testimonial.name}
          </div>
          <div className="text-muted-foreground text-[11px] leading-tight mt-0.5 truncate">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  );
});

const MarqueeRow = React.memo(function MarqueeRow({
  items,
  direction = "left",
  speed = 40,
}: {
  items: readonly Testimonial[];
  direction?: "left" | "right";
  speed?: number;
}) {
  // Tripled list for infinite seamless marquee motion
  const tripledItems = useMemo(
    () => [...items, ...items, ...items],
    [items]
  );

  return (
    <div className="flex overflow-hidden gap-6 py-2">
      <motion.div
        animate={{ x: direction === "left" ? [0, -1000] : [-1000, 0] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex gap-6 shrink-0"
      >
        {tripledItems.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </motion.div>
    </div>
  );
});

interface CTAProps {
  className?: string;
}

function CTAComponent({ className = "" }: CTAProps) {
  const row1 = useMemo(() => STATIC_TESTIMONIALS.slice(0, 3), []);
  const row2 = useMemo(() => STATIC_TESTIMONIALS.slice(3, 6), []);
  const row3 = useMemo(() => STATIC_TESTIMONIALS.slice(0, 3), []);

  return (
    <section
      id="cta"
      className={`relative w-full bg-background text-foreground py-24 sm:py-36 px-4 sm:px-6 overflow-hidden transition-colors duration-300 ${className}`}
    >
      {/* Mesh Ambient Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Side Gradient Fade Masks to seamlessly blend the moving cards */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

      {/* Background Sliders / Moving Marquee Rows */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 pointer-events-none select-none overflow-hidden opacity-60 dark:opacity-40">
        <MarqueeRow items={row1} direction="left" speed={48} />
        <MarqueeRow items={row2} direction="right" speed={56} />
        <MarqueeRow items={row3} direction="left" speed={52} />
      </div>

      {/* Transparent Centered Content (No Modal / Box Background) */}
      <div className="max-w-[1200px] mx-auto relative z-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-center max-w-[650px] px-6"
          >
            <span className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] uppercase block mb-6">
              AUTONOMOUS REACH AT SCALE
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-[1.12] tracking-tight mb-6">
              Ready to scale<br />
              <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
                your marketing fleet?
              </span>
            </h2>

            <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-10 max-w-[480px] mx-auto">
              Deploy 13 autonomous AI agents to research, draft, format, and
              dispatch high-converting social campaigns with deterministic brand
              safety.
            </p>

            <div className="flex justify-center">
              <Link
                href="/talk-to-sales"
                className="bg-primary text-primary-foreground font-bold py-4 px-10 rounded-full flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(168,85,247,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm sm:text-base cursor-pointer"
              >
                <Phone size={18} fill="currentColor" />
                <span>Book a FREE consultation</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Export both default CTA and named Cta03Orbit for seamless backwards compatibility
export const Cta03Orbit = React.memo(CTAComponent);
export default React.memo(CTAComponent);
