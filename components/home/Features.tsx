"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { Bot, Zap, MessageSquare, BarChart3, Globe, Shield } from "lucide-react";
import React from "react";

const features = [
  {
    title: "AI Blog Writer",
    description: "Compose SEO-optimized blog posts that rank. Our AI handles research, structure, and tone.",
    icon: <Bot className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Social Media Engine",
    description: "Generate 30 days of social media content in minutes. Tailored for Twitter, LinkedIn, and Instagram.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Ad Copy Generator",
    description: "Create high-converting ad copy for Meta, Google, and TikTok. Built on proven marketing frameworks.",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Neuro-Analytics",
    description: "Analyze the psychological impact of your content before you hit publish.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Global Localization",
    description: "Automatically adapt content for 40+ regions with cultural intelligence.",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Brand Safety Guard",
    description: "Real-time monitoring to ensure all AI outputs align with your brand identity.",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-red-50 text-red-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-[#020617] dark:text-white mb-6 tracking-tight"
          >
            One platform. <span className="text-[#2D46FF] dark:text-blue-500">Infinite growth.</span>
          </motion.h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Replace multiple expensive tools with one AI-powered engine designed for speed and performance.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl dark:hover:shadow-none transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-800 dark:text-blue-400 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#020617] dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
