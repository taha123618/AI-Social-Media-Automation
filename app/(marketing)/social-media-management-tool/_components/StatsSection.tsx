"use client";

import { motion } from "framer-motion";
import { Timer, TrendingUp, Flame, ShieldCheck, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Timer,
    value: "45%",
    label: "Reduced Planning Cycles",
    desc: "Autonomous drafting cuts editorial coordination by nearly half.",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: TrendingUp,
    value: "2.8x",
    label: "Engagement Velocity",
    desc: "Algorithmic peak-time scheduling boosts organic reach.",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Flame,
    value: "12+ hrs",
    label: "Weekly Time Saved",
    desc: "Reclaim high-value hours previously lost to manual multi-posting.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "On-Time Dispatch",
    desc: "Reliable BullMQ transactional queue with zero dropped dispatches.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function StatsSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden transition-colors">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROVEN ROI &amp; IMPACT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Measurable Growth That <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Speaks for Itself
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Real enterprise metrics validated across high-growth teams, marketing agencies, and creators scaling automated social presence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center p-7 sm:p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} border flex items-center justify-center mx-auto mb-5 shadow-xs`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.desc}
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
