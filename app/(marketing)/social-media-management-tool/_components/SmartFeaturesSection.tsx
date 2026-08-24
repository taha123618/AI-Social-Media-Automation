"use client";

import { motion } from "framer-motion";
import { Globe, Bot, LayoutDashboard, Image, Layers } from "lucide-react";

const smartFeatures = [
  {
    icon: Globe,
    title: "Multi-Platform Publishing",
    desc: "Manage posts for Facebook, Instagram, LinkedIn, YouTube, Pinterest & X — from one powerful dashboard. Save hours by publishing across platforms in one click.",
    color: "#2D46FF",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Bot,
    title: "AI-Powered Content Creation",
    desc: "Generate engaging content in seconds. Select tone. Retry or refine with smart controls. Always sound on-brand. No writer's block ever again.",
    color: "#7C3AED",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Post Management",
    desc: "Get a complete overview of published, scheduled, failed, and drafted posts — all in one place. Track every post's journey at a glance.",
    color: "#0EA5E9",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: Image,
    title: "Media Library & Stock Access",
    desc: "Reuse previously uploaded visuals or explore stock images & gifs. Organize, find, and insert assets easily. Keep your brand assets ready at your fingertips.",
    color: "#10B981",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Layers,
    title: "Reusable Templates & Smart Scheduling",
    desc: "Save your high-performing content + media as templates. Use them anytime with one click. Configure posting times and click 'Add to Queue' to auto-publish.",
    color: "#F59E0B",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

export default function SmartFeaturesSection() {
  return (
    <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Features</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter">
            Smart Features Built<br />
            <span className="text-[#2D46FF] dark:text-blue-500">for Social Success</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-bold max-w-2xl mx-auto">
            Every feature is thoughtfully crafted to simplify your workflow and elevate your brand presence.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Top two large cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {smartFeatures.slice(0, 2).map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: feat.color }} />
                <div className={`inline-flex w-14 h-14 rounded-2xl ${feat.bg} items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-7 h-7" style={{ color: feat.color }} />
                </div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4 leading-tight">{feat.title}</h3>
                <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom three smaller cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {smartFeatures.slice(2).map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: feat.color }} />
                <div className={`inline-flex w-12 h-12 rounded-xl ${feat.bg} items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white mb-3 leading-tight">{feat.title}</h3>
                <p className="text-slate-400 dark:text-slate-500 font-medium text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
