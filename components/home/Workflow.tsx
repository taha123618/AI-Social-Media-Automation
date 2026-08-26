"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations/motion";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { Rocket, Sparkles, Send, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Brand DNA & Topical Mapping",
    description: "Ingest your knowledge base, brand voice guidelines, and target persona definitions into pgvector RAG.",
    icon: <Rocket className="w-5 h-5 text-primary" />,
    badge: "CONTEXT LAYER",
  },
  {
    number: "02",
    title: "Autonomous Swarm Research",
    description: "Mastra analytical agents monitor trends, keyword difficulty, and audience sentiment in real time.",
    icon: <Sparkles className="w-5 h-5 text-accent" />,
    badge: "INTEL LOOP",
  },
  {
    number: "03",
    title: "Multi-Channel Synthesis",
    description: "Generate SEO-optimized long-form articles, Gutenberg blocks, and synchronized social carousels.",
    icon: <Send className="w-5 h-5 text-purple-400" />,
    badge: "GENERATION",
  },
  {
    number: "04",
    title: "Deterministic Dispatch & Attribution",
    description: "Schedule across platforms with peak-cadence timing and track compounding revenue ROI metrics.",
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    badge: "ATTRIBUTION",
  },
];

export default function Workflow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-scrubbed vertical progress line
      gsap.fromTo(
        progressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 20%",
            end: "bottom 80%",
            scrub: 1,
          },
        }
      );

      // Alternate x-entrance per step
      const stepsEls = gsap.utils.toArray<HTMLElement>(".workflow-step");
      stepsEls.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: i % 2 === 0 ? -24 : 24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
              end: "top 55%",
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="py-24 px-4 bg-muted/20 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            PIPELINE ARCHITECTURE
          </div>
          <motion.h2
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight"
          >
            How the Autonomous Swarm <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Executes Your Strategy
            </span>
          </motion.h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            From raw concept to scheduled multi-channel distribution in 4 deterministic steps.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Central vertical progress track — desktop only */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/70 -translate-x-1/2 hidden md:block">
            <div
              ref={progressRef}
              className="w-full bg-gradient-to-b from-primary to-accent origin-top"
              style={{ height: "100%" }}
            />
          </div>

          {/* Mobile left-border timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50 md:hidden" />

          <div className="space-y-10 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 pl-10 md:pl-0 relative workflow-step ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Mobile: left dot node */}
                <div className="absolute left-0 top-5 md:hidden z-10">
                  <div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-sm shadow-primary/20">
                    <span className="text-[10px] font-mono font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1">
                  <div
                    className={`group p-6 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 ${
                      index % 2 !== 0 ? "md:text-right" : ""
                    }`}
                  >
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        {step.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Node */}
                <div className="relative z-10 hidden md:flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <span className="text-xs font-mono font-bold text-primary">{step.number}</span>
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <Link href="/register">
            <Button size="lg" className="h-11 px-8 rounded-lg font-semibold shadow-md shadow-primary/20">
              Deploy Your Fleet
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
