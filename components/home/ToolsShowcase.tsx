"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  PenTool,
  Hash,
  Image as ImageIcon,
  Video,
  MessageSquare,
  FileText,
  BarChart,
  Calendar,
  Share2,
  Zap,
  Target,
  Globe
} from "lucide-react";

const tools = [
  { name: "Instagram Bio Gen", icon: <FaInstagram className="w-5 h-5" />, category: "Social" },
  { name: "Viral Tweet Engine", icon: <FaXTwitter className="w-5 h-5" />, category: "Social" },
  { name: "LinkedIn Post Writer", icon: <FaLinkedin className="w-5 h-5" />, category: "Professional" },
  { name: "YouTube Script Pro", icon: <FaYoutube className="w-5 h-5" />, category: "Video" },
  { name: "Hashtag Researcher", icon: <Hash className="w-5 h-5" />, category: "Growth" },
  { name: "AI Image Prompting", icon: <ImageIcon className="w-5 h-5" />, category: "Creative" },
  { name: "TikTok Hook Creator", icon: <Zap className="w-5 h-5" />, category: "Video" },
  { name: "Bio Link Optimizer", icon: <Share2 className="w-5 h-5" />, category: "Conversion" },
  { name: "Content Multiplier", icon: <Target className="w-5 h-5" />, category: "Efficiency" },
  { name: "SEO Meta Generator", icon: <Globe className="w-5 h-5" />, category: "SEO" },
  { name: "Ad Copy variants", icon: <PenTool className="w-5 h-5" />, category: "Marketing" },
  { name: "Caption polisher", icon: <MessageSquare className="w-5 h-5" />, category: "Creative" },
  { name: "Blog To Thread", icon: <FileText className="w-5 h-5" />, category: "Growth" },
  { name: "Engagement Predictor", icon: <BarChart className="w-5 h-5" />, category: "Analytics" },
  { name: "Perfect Time Poster", icon: <Calendar className="w-5 h-5" />, category: "Strategy" },
  { name: "Video Description", icon: <Video className="w-5 h-5" />, category: "Video" },
];

export default function ToolsShowcase() {
  return (
    <section id="tools" className="py-24 bg-white dark:bg-slate-950 relative transition-colors">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto mb-16">
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Power Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6 tracking-tight">
            80+ AI tools to <span className="text-[#2D46FF] dark:text-blue-500">supercharge</span> your workflow
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            From viral hooks to deep technical data, we've automated every part of the social pipeline.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-50 dark:hover:shadow-none transition-all duration-300 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#2D46FF] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-colors mb-4">
                {tool.icon}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{tool.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tool.category}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <button className="bg-slate-950 dark:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
            View all 80+ tools
          </button>
        </motion.div>
      </div>
    </section>
  );
}
