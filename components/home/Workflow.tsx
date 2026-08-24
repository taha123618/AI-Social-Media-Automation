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
    title: "Define Your Goal",
    description: "Tell SocialAI what you want to achieve—brand awareness, lead gen, or viral growth.",
    icon: <Rocket className="w-6 h-6" />,
  },
  {
    title: "AI Analysis",
    description: "Our engine analyzes your brand DNA and historical performance to generate the perfect strategy.",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    title: "Auto-Generation",
    description: "Get 30 days of high-converting social posts across all platforms in seconds.",
    icon: <Send className="w-6 h-6" />,
  },
  {
    title: "Scale Experimentally",
    description: "Publish, analyze, and let our AI optimize your content for exponential reach.",
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

export default function Workflow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Progress Bar Animation
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

      // Stagger Steps Animation
      const stepsElements = gsap.utils.toArray<HTMLElement>(".workflow-step");
      stepsElements.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              end: "top 50%",
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
      className="py-32 px-4 bg-slate-950 dark:bg-stone-100 relative overflow-hidden rounded-[4rem] mx-4 my-8 transition-colors"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full -z-10" />

      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <motion.span
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block"
          >
            The Social Engine
          </motion.span>
          <motion.h2
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white dark:text-slate-950 mb-8 tracking-tighter"
          >
            From idea to <span className="text-blue-400">viral</span> <br /> in four simple steps
          </motion.h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Central Progress Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2 hidden md:block">
            <div
              ref={progressRef}
              className="w-full bg-[#2D46FF] shadow-[0_0_20px_rgba(45,70,255,0.5)] origin-top"
              style={{ height: '100%' }}
            />
          </div>

          <div className="space-y-24 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-12 workflow-step ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className={`flex flex-col ${index % 2 !== 0 ? "md:items-end md:text-right" : "md:items-start"}`}>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-black text-white dark:text-slate-950 mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-slate-400 dark:text-slate-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Counter Circle */}
                <div className="relative z-10 hidden md:block">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border-4 border-[#020617] dark:border-slate-950 flex items-center justify-center text-slate-950 dark:text-white font-black text-xl shadow-2xl">
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
