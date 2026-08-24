"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lightbulb, Search, Cpu, Eye, Send, CheckCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    icon: Lightbulb,
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    title: "Enter Your Topic or Keyword",
    description:
      "Type a topic, paste a keyword, or let our AI suggest trending topics in your niche. Our keyword intelligence tool shows search volume, difficulty, and opportunity score instantly.",
    detail: "Avg. time: 30 seconds",
  },
  {
    number: "02",
    icon: Search,
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    title: "AI Researches & Outlines",
    description:
      "Our AI scans top-ranking competitors, extracts key entities, and builds a data-backed outline with H2/H3 structure, FAQ sections, and internal link placeholders.",
    detail: "Avg. time: 45 seconds",
  },
  {
    number: "03",
    icon: Cpu,
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    title: "Full Article Generated",
    description:
      "GPT-5-class models write a 2,500–8,000 word article with your brand voice, naturally integrated keywords, proper transitions, and compelling storytelling.",
    detail: "Avg. time: 60 seconds",
  },
  {
    number: "04",
    icon: Eye,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    title: "Review & Optimize in Real Time",
    description:
      "The built-in editor shows SEO score, readability grade, keyword coverage, and AI-detection risk live. Edit with AI-assist or accept the output as-is.",
    detail: "Avg. time: 5 minutes",
  },
  {
    number: "05",
    icon: Send,
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    title: "Publish Directly to Your CMS",
    description:
      "One-click export to WordPress, Webflow, Shopify, Ghost, or Notion. Schema markup, Open Graph tags, and featured image prompts are auto-generated.",
    detail: "Avg. time: 10 seconds",
  },
  {
    number: "06",
    icon: CheckCircle,
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    title: "Track Rankings & Iterate",
    description:
      "Connect Google Search Console and watch your article climb. Our AI suggests updates when rankings slip or when competitors publish new content on the same topic.",
    detail: "Ongoing — automated",
  },
];

export default function BlogWorkflow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsWrapperRef = useRef<HTMLDivElement>(null);
  const connectorLineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none none",
      },
    });

    headerTl
      .from(".workflow-header-badge", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      })
      .from(
        ".workflow-header-title",
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3",
      )
      .from(
        ".workflow-header-subtitle",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.4",
      );

    gsap.fromTo(
      connectorLineRef.current,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: stepsWrapperRef.current,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 1.5,
        },
      },
    );

    const steps = sectionRef.current!.querySelectorAll<HTMLElement>(
      ".workflow-step",
    );

    steps.forEach((step) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          end: "top 40%",
          toggleActions: "play none none none",
        },
      });

      tl
        .from(step, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
        })
        .from(
          step.querySelector(".workflow-step-icon"),
          {
            scale: 0.6,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.4",
        )
        .from(
          step.querySelector(".workflow-step-title"),
          {
            opacity: 0,
            x: -20,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3",
        )
        .from(
          step.querySelector(".workflow-step-badge"),
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.2",
        )
        .from(
          step.querySelector(".workflow-step-desc"),
          {
            opacity: 0,
            y: 15,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2",
        );
    });

    gsap.from(ctaRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 85%",
        end: "top 60%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="relative py-32 bg-background dark:bg-slate-950 overflow-hidden transition-colors"
    >
      <div className="absolute left-0 top-1/3 w-[400px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Header */}
        <div
          ref={headerRef}
          className="max-w-3xl mx-auto text-center mb-24"
        >
          <div className="workflow-header-badge inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-6">
            <Cpu className="h-4 w-4" />
            How It Works
          </div>
          <h2 className="workflow-header-title text-4xl sm:text-5xl font-black tracking-tighter text-slate-950 dark:text-white mb-6 leading-[1.05]">
            From idea to ranked article{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
              in under 10 minutes
            </span>
          </h2>
          <p className="workflow-header-subtitle text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            A streamlined 6-step pipeline that handles everything from research
            to publishing, so you can focus on strategy instead of staring at a
            blank page.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsWrapperRef} className="relative">
          {/* Vertical connector line */}
          <div
            ref={connectorLineRef}
            className="absolute left-[2.75rem] top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500/40 via-violet-500/20 to-cyan-500/10 hidden lg:block origin-top"
          />

          <div className="space-y-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="workflow-step group flex gap-8 items-start"
                >
                  {/* Icon / number */}
                  <div className="workflow-step-icon flex-shrink-0 relative">
                    <div
                      className={`w-[5.5rem] h-[5.5rem] rounded-3xl border ${step.border} ${step.bg} flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 ${step.color} mb-1`} />
                      <span className={`text-xs font-black ${step.color}`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-3 pb-8 border-b border-black/5 dark:border-white/5 group-last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="workflow-step-title text-xl font-bold text-slate-950 dark:text-white">
                        {step.title}
                      </h3>
                      <span
                        className={`workflow-step-badge text-xs font-bold px-3 py-1 rounded-full border ${step.border} ${step.bg} ${step.color} flex-shrink-0`}
                      >
                        {step.detail}
                      </span>
                    </div>
                    <p className="workflow-step-desc text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div
          ref={ctaRef}
          className="mt-20 p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-r from-blue-600/10 via-violet-600/5 to-emerald-600/10 dark:from-blue-100/10 dark:via-violet-100/10 dark:to-emerald-100/10 text-center"
        >
          <p className="text-2xl font-black text-slate-950 dark:text-white mb-2">
            Total time from idea to published article:{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              ~10 minutes
            </span>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            vs. 6–10 hours of manual writing, research, and optimization.
          </p>
        </div>
      </div>
    </section>
  );
}
