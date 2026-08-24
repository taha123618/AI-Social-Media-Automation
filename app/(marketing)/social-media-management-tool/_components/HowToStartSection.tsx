"use client";

import { motion } from "framer-motion";
import { Globe, Bot, Clock, Calendar, Library, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Connect Your Social Channels",
    desc: "Facebook, LinkedIn, Instagram, Pinterest, X, YouTube — all in one place.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Bot,
    title: "Create Platform-Specific Posts in Seconds",
    desc: "Generate AI content or customize your own. One click = post to many.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Clock,
    title: "Schedule or Add to Queue",
    desc: "Plan content for any date or just click 'Add to Queue' to auto-fill the next slot.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    icon: Calendar,
    title: "Plan Campaigns on a Visual Calendar",
    desc: "Drag and drop posts, preview scheduled weeks, make edits anytime.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: Library,
    title: "Save Time with Media Library & Templates",
    desc: "No need to start over. Reuse best-performing content with a click.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: BarChart3,
    title: "Track & Improve with Analytics Dashboard",
    desc: "What's working? What's not? Know instantly and adjust smartly.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export default function HowToStartSection() {
  return (
    <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Get Started</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter">
            Start Posting in Minutes<br />
            <span className="text-[#2D46FF] dark:text-blue-500">It's That Simple</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-bold max-w-2xl mx-auto">
            No steep learning curves. Just connect your accounts, create your post, and let SocialAI do the magic.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all group"
            >
              <div className={`inline-flex w-14 h-14 rounded-2xl ${step.bg} items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <step.icon className={`w-7 h-7 ${step.color}`} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 mb-3">
                Step {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3 leading-tight">{step.title}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
