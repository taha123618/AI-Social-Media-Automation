"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Layers, PinIcon } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const platformFeatures = [
  { icon: Bot, title: "AI Caption Assistant", desc: "Effortlessly write platform-perfect captions in multiple tones" },
  { icon: Zap, title: "One-Click Publishing", desc: "Post everywhere without repeating the same steps" },
  { icon: Layers, title: "Visual + Text Templates", desc: "Save and reuse posts that perform well across platforms" },
];

const platforms = [
  { icon: FaFacebook, name: "Facebook", color: "text-blue-600" },
  { icon: FaInstagram, name: "Instagram", color: "text-pink-500" },
  { icon: FaLinkedin, name: "LinkedIn", color: "text-blue-700" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-600" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-slate-900 dark:text-white" },
  { icon: PinIcon, name: "Pinterest", color: "text-red-500" },
];

export default function BrandReachSection() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Platform Reach</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter">
            Expand Your Brand's Reach<br />
            <span className="text-[#2D46FF] dark:text-blue-500">Across All Key Platforms</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-bold max-w-2xl mx-auto">
            Elevate every post with precision, consistency, and strategy across every major platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {platformFeatures.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <feat.icon className="w-8 h-8 text-[#2D46FF] dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          {platforms.map(({ icon: Icon, name, color }) => (
            <div key={name} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
