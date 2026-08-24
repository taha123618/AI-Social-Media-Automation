"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { ChevronRight, Play, Sparkles, Send, TrendingUp, Users, Calendar } from "lucide-react";
import React from "react";
import TextType from "../TextType";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-40 overflow-hidden bg-white dark:bg-slate-950 selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-70" />

      <div className="container mx-auto px-4 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Announcement Pill */}
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 mb-10 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#2D46FF] animate-pulse" />
            <span className="text-sm font-bold text-[#2D46FF] dark:text-blue-400 tracking-tight">V2.0 is live: Multi-channel AI Scheduling</span>
            <ChevronRight className="w-4 h-4 text-[#2D46FF] dark:text-blue-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeIn}
            className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-white mb-8 leading-[0.95]"
          >
            Scale your <span className="text-[#2D46FF] dark:text-blue-500">social organic</span> with AI
          </motion.h1>

          {/* Subheader */}
          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            SocialAI transforms your raw ideas into high-converting posts.
            Automate your content pipeline and grow 10x faster.
          </motion.p>

          {/* Integrated Signup Field */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-xl mx-auto relative z-20"
          >
            <div className="w-full relative group">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full px-8 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-[#2D46FF]/10 focus:border-[#2D46FF] transition-all text-slate-950 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none text-lg font-bold"
              />
            </div>
            <Button className="w-full sm:w-auto bg-[#2D46FF] hover:bg-[#1E35E0] text-white px-10 py-8 rounded-2xl text-xl font-black shadow-2xl shadow-blue-400/30 dark:shadow-none transition-all hover:scale-105 active:scale-95">
              Start for free
            </Button>
          </motion.div>

          <motion.div variants={fadeIn} className="text-sm font-bold text-slate-400 mb-20 flex items-center justify-center gap-4">
            <span>✓ 14-day free trial</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>✓ No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <TextType text={["10x faster", "10x more engagement", "10x more leads"]} className="text-sm font-bold text-slate-400" />
          </motion.div>

          {/* Sophisticated Product Mockup */}
          <motion.div
            variants={fadeIn}
            className="relative mx-auto max-w-6xl rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_50px_100px_-20px_rgba(45,70,255,0.15)] dark:shadow-none overflow-hidden aspect-[16/10] group"
          >
            {/* Mockup Navbar */}
            <div className="h-14 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center px-8 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-1/3 h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20" />
            </div>

            {/* Mockup Content Grid */}
            <div className="p-8 grid grid-cols-12 gap-8 h-full">
              {/* Sidebar */}
              <div className="col-span-3 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center px-4 gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-2/3 h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>

              {/* Main Feed */}
              <div className="col-span-6 space-y-8">
                <div className="p-6 rounded-2xl border-2 border-[#2D46FF]/10 dark:border-blue-500/10 bg-blue-50/30 dark:bg-blue-900/10 relative overflow-hidden group/card">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#2D46FF] flex items-center justify-center text-white">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">AI Post Generator</h4>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Generating for LinkedIn...</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-[#2D46FF]"
                      />
                    </div>
                    <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                        className="h-full bg-blue-400"
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">"Here's why autonomous AI is the future of social..."</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                    <div className="text-2xl font-black text-slate-950 dark:text-white">+124%</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Growth</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <Users className="w-8 h-8 text-blue-500 mb-3" />
                    <div className="text-2xl font-black text-slate-950 dark:text-white">12.4k</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Followers</div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="col-span-3 space-y-6">
                <div className="p-6 rounded-2xl bg-slate-950 dark:bg-slate-900 text-white h-full border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="font-bold text-xs">Calendar</h5>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                        <div className="w-2/3 h-1.5 bg-white/20 rounded-full" />
                        <div className="w-1/2 h-1.5 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-20">
                    <Button size="sm" className="w-full bg-[#2D46FF] text-white text-[10px] font-black h-8 rounded-lg">
                      AUTO-SCHEDULE
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Accents */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-10 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-50 dark:border-slate-800 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#2D46FF]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Status</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Post Sent</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Social Proof Marquee */}
      <div className="mt-32 border-y border-slate-100 dark:border-white/5 py-12 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm relative">
        <div className="container mx-auto px-4 mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-black text-slate-400 dark:text-slate-500">Trusted by the next generation of brands</p>
        </div>
        <div className="flex gap-16 whitespace-nowrap animate-scroll-x opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {["INSTAGRAM", "TIKTOK", "LINKEDIN", "X (TWITTER)", "YOUTUBE", "THREADS", "PINTEREST", "SUBSTACK"].map((company) => (
            <div key={company} className="flex items-center gap-3 text-2xl font-black text-slate-950 dark:text-white tracking-tighter">
              {company}
            </div>
          ))}
          {["INSTAGRAM", "TIKTOK", "LINKEDIN", "X (TWITTER)", "YOUTUBE", "THREADS", "PINTEREST", "SUBSTACK"].map((company) => (
            <div key={company + "_2"} className="flex items-center gap-3 text-2xl font-black text-slate-950 dark:text-white tracking-tighter">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
