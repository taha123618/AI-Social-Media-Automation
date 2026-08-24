"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { User, Users, Building2, Rocket, TrendingUp, ShieldCheck } from "lucide-react";
import React from "react";

const personas = [
  {
    title: "Solo Creators",
    description: "Build a global personal brand without hiring a social media manager. SocialAI acts as your ghostwriter and strategist.",
    icon: <User className="w-6 h-6" />,
    stats: "+240% reach",
    benefits: ["Viral Hook Generation", "Multi-platform distribution", "Personal Voice Tuning"],
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Marketing Agencies",
    description: "Manage 50+ clients with the same team size. Automate content production and focus on high-level strategy.",
    icon: <Users className="w-6 h-6" />,
    stats: "5x productivity",
    benefits: ["Client Approval Flows", "Bulk Content Scheduling", "White-label Reporting"],
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Enterprise Brands",
    description: "Scale high-quality, brand-safe content across hundreds of local and global social profiles autonomously.",
    icon: <Building2 className="w-6 h-6" />,
    stats: "99% consistency",
    benefits: ["Brand Safety Guard", "Localized Content", "SSO & Role Access"],
    color: "bg-slate-900 text-white",
  },
];

export default function UseCases() {
  return (
    <section id="solutions" className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/30 dark:bg-blue-900/10 blur-[150px] rounded-full -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Use Cases</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white mb-8 tracking-tighter">
            Solutions for <span className="text-[#2D46FF] dark:text-blue-500">every scale</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Whether you're building a personal brand or managing a global conglomerate,
            SocialAI scales with your ambitions.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {personas.map((persona, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col ${persona.color.includes("bg-slate-900") ? "bg-slate-950 dark:bg-slate-900 text-white border-transparent" : "bg-white dark:bg-slate-900/50"
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${persona.color.includes("bg-slate-900") ? "bg-white/10 text-white" : persona.color.replace("bg-", "dark:bg-").replace("text-", "dark:text-")
                }`}>
                {persona.icon}
              </div>
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-2xl font-black tracking-tight">{persona.title}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${persona.color.includes("bg-slate-900") ? "bg-blue-500 text-white" : "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  }`}>
                  {persona.stats}
                </span>
              </div>
              <p className={`text-sm leading-relaxed mb-8 flex-grow font-medium ${persona.color.includes("bg-slate-900") ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                }`}>
                {persona.description}
              </p>

              <ul className="space-y-4 mb-4">
                {persona.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold">
                    <div className={`w-1.5 h-1.5 rounded-full ${persona.color.includes("bg-slate-900") ? "bg-blue-400" : "bg-[#2D46FF] dark:bg-blue-400"
                      }`} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
