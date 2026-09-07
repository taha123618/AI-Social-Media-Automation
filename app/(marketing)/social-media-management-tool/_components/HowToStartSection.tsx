"use client";

import { motion } from "framer-motion";
import { Globe, Bot, Clock, Calendar, Library, BarChart3, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Connect Your Social Channels",
    desc: "LinkedIn, X, Instagram, Facebook, and YouTube — securely authenticate via OAuth 2.0 in one unified dashboard.",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Bot,
    title: "AI Swarm Copy Synthesis",
    desc: "Generate calibrated, platform-adapted copy variants in seconds, complete with hooks, hashtags, and CTAs.",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Clock,
    title: "Algorithmic Peak Queue",
    desc: "Schedule posts for precise time slots or drop them into your auto-queue to hit maximum follower engagement.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Calendar,
    title: "Interactive Visual Calendar",
    desc: "Drag and drop campaigns, inspect cross-network dispatch schedules, and preview visual feeds before they go live.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Library,
    title: "Vector Media Asset Library",
    desc: "Store brand assets, generate AI imagery, and automatically adapt aspect ratios for stories, feeds, and threads.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Live Engagement Telemetry",
    desc: "Monitor impressions, click-through rates, and audience sentiment in real time to continuously train your AI model.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

export default function HowToStartSection() {
  return (
    <section className="py-24 px-4 bg-muted/30 border-y border-border/60 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMPLIFIED WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Start Posting in Minutes <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Zero Friction, Instant Output
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            No complex setup or steep learning curves. Connect your profiles once, configure your brand tone, and let autonomous swarms handle the rest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card/80 backdrop-blur-md rounded-2xl p-7 border border-border/80 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${step.bg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
