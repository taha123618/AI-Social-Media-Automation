"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, PinIcon } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import Link from "next/link";

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const platforms = [
  { icon: FaFacebook, name: "Facebook", color: "text-blue-600" },
  { icon: FaInstagram, name: "Instagram", color: "text-pink-500" },
  { icon: FaLinkedin, name: "LinkedIn", color: "text-blue-700" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-600" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-slate-900 dark:text-white" },
  { icon: PinIcon, name: "Pinterest", color: "text-red-500" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-radial from-blue-50 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent opacity-60 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl">
        <motion.div variants={stagger} initial="initial" animate="animate">
          <motion.span
            variants={fadeIn}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-[#2D46FF] dark:text-blue-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 border border-blue-100 dark:border-blue-900"
          >
            <Zap className="w-3 h-3" />
            AI-Powered Social Media Management
          </motion.span>

          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter leading-[1.05]"
          >
            Social Media <br />
            <span className="text-[#2D46FF] dark:text-blue-500">Management Tool</span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold mb-4 max-w-3xl mx-auto leading-relaxed">
            One Tool to Rule All Your Social Media
          </motion.p>
          <motion.p variants={fadeIn} className="text-base text-slate-400 dark:text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Seamlessly create, schedule, and manage posts for all your platforms — powered by AI, built for creators, marketers &amp; teams. Loved by over a million users and 100+ brands!
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/register"
              className="group flex items-center gap-3 bg-[#2D46FF] hover:bg-[#1E35E0] text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 dark:shadow-none transition-all active:scale-95"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#2D46FF] dark:hover:text-blue-400 font-black transition-colors"
            >
              View Pricing →
            </Link>
          </motion.div>
        </motion.div>

        {/* Platform logos row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8"
        >
          {platforms.map(({ icon: Icon, name, color }) => (
            <div key={name} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all">
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
