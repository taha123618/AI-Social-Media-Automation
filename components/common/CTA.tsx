"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "../home/MagneticButton";
import React from "react";

export default function CTA() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors">
      <div className="container mx-auto">
        <div className="relative p-12 md:p-24 rounded-[3.5rem] bg-[#020617] dark:bg-slate-900/50 border border-white/5 dark:border-white/10 overflow-hidden group">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2D46FF]/20 to-transparent" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2D46FF]/10 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight"
            >
              Ready to automate your <br /> <span className="text-blue-400">social growth?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 dark:text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium"
            >
              Join 25,000+ creators and brands who use SocialAI to create,
              schedule, and grow autonomously.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <MagneticButton>
                <Button className="bg-[#2D46FF] hover:bg-[#1E35E0] text-white px-10 py-8 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                  Get Started Free
                </Button>
              </MagneticButton>
              <Button variant="outline" className="border-white/10 dark:text-white  px-10 py-8 rounded-2xl text-xl font-black">
                Book a Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-8 text-slate-500 dark:text-slate-400 font-bold text-sm"
            >
              <span className="flex items-center gap-2">✓ No credit card</span>
              <span className="flex items-center gap-2">✓ Cancel anytime</span>
              <span className="flex items-center gap-2">✓ 14-day trial</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
