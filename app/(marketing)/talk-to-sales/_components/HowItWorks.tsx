"use client";

import { motion } from "framer-motion";
import { Calendar, Monitor, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    step: "01",
    title: "Book Your Slot",
    desc: "Choose a date and time that works for you. Our calendar shows availability in your timezone.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Monitor,
    step: "02",
    title: "Personalized Walkthrough",
    desc: "Join a 30-minute session where we demonstrate features relevant to your use case.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Q&A and Use Cases",
    desc: "Get your specific questions answered. We'll show how SocialAI solves your exact challenges.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Next Steps & Onboarding",
    desc: "Receive a custom proposal, trial access, and a clear roadmap for getting your team started.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" />
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            From Booking to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Going Live
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Your demo experience is designed to be efficient, informative, and tailored to you.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-px bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative"
              >
                <div className={`hidden lg:flex absolute -top-3 left-8 w-6 h-6 rounded-full ${step.iconBg} border ${step.border} items-center justify-center z-10`}>
                  <span className={`text-[10px] font-black ${step.iconColor}`}>{step.step}</span>
                </div>

                <div className={`p-6 rounded-[8px] border ${step.border} bg-gradient-to-b ${step.color} backdrop-blur-sm h-full`}>
                  <div className={`w-12 h-12 rounded-[8px] ${step.iconBg} border ${step.border} flex items-center justify-center mb-4`}>
                    <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`lg:hidden text-xs font-black ${step.iconColor}`}>{step.step}</span>
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex lg:hidden justify-center py-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
