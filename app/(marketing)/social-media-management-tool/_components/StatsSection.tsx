"use client";

import { motion } from "framer-motion";
import { Timer, TrendingUp, Flame } from "lucide-react";

const stats = [
  { icon: Timer, value: "45%", label: "less time spent on content planning", color: "text-blue-500" },
  { icon: TrendingUp, value: "2x", label: "engagement rate within 30 days", color: "text-violet-500" },
  { icon: Flame, value: "10+", label: "hours saved weekly with AI & auto-queue", color: "text-orange-500" },
];

export default function StatsSection() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Results</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter">
            Results That <span className="text-[#2D46FF] dark:text-blue-500">Speak</span> for Themselves
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto">
            Real results, not just promises. Our users have seen sharper engagement, quicker workflows, and smarter social growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter mb-2">{stat.value}</div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
