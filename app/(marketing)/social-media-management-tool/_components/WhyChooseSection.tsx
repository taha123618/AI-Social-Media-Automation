"use client";

import { motion } from "framer-motion";
import { Zap, Globe, ShieldCheck, Bot } from "lucide-react";

const whyChoose = [
  { icon: Zap, title: "Smart enough for pros, simple enough for beginners" },
  { icon: Globe, title: "Built for multi-platform domination" },
  { icon: ShieldCheck, title: "Packed with agency-grade tools" },
  { icon: Bot, title: "Backed by a trusted AI engine" },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 px-4 bg-[#2D46FF] dark:bg-blue-700 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Why Choose SocialAI?
          </h2>
          <p className="text-blue-100 font-bold max-w-2xl mx-auto text-lg">
            SocialAI brings everything you need to grow faster, engage better, and manage smarter — all in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {whyChoose.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-black leading-snug">{item.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
