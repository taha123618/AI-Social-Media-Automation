"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations/motion";
import { Rocket, Sparkles, Send, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "1. Brand DNA & Topical Mapping",
    description: "Ingest your knowledge base, brand voice guidelines, and target persona definitions into pgvector RAG.",
    icon: <Rocket className="w-5 h-5 text-primary" />,
  },
  {
    title: "2. Autonomous Swarm Research",
    description: "Mastra analytical agents monitor trends, keyword difficulty, and audience sentiment in real time.",
    icon: <Sparkles className="w-5 h-5 text-accent" />,
  },
  {
    title: "3. Multi-Channel Synthesis",
    description: "Generate SEO-optimized long-form articles, Gutenberg blocks, and synchronized social carousels.",
    icon: <Send className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "4. Deterministic Dispatch & Attribution",
    description: "Schedule across platforms with peak-cadence timing and track compounding revenue ROI metrics.",
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
  },
];

export default function Workflow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      const stepsElements = gsap.utils.toArray<HTMLElement>(".workflow-step");
      stepsElements.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
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
      <div className="container mx-auto max-w-5xl">
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
          {/* Central Progress Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block">
            <div
              ref={progressRef}
              className="w-full bg-primary shadow-sm origin-top"
              style={{ height: "100%" }}
            />
          </div>

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-6 workflow-step ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div
                    className={`p-6 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all ${
                      index % 2 !== 0 ? "md:items-end md:text-right" : "md:items-start"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      {step.icon}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Counter Node */}
                <div className="relative z-10 hidden md:block">
                  <div className="w-9 h-9 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-mono font-bold text-xs shadow-md">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
