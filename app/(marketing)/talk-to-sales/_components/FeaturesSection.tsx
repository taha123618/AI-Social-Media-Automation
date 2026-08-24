"use client";

import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Users,
  Shield,
  MessageSquare,
  Workflow,
  Sparkles,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "AI-Powered Automation",
    desc: "Schedule, publish, and optimize content across all platforms from a single dashboard.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Real-time insights on engagement, reach, and conversion — with AI-powered recommendations.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Built-in approval workflows, role-based access, and client management for agencies.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "SOC 2 compliance, SSO, audit logs, and granular permission controls for peace of mind.",
  },
  {
    icon: MessageSquare,
    title: "AI Content Studio",
    desc: "Generate on-brand posts, captions, and visuals with your unique brand voice in seconds.",
  },
  {
    icon: Globe,
    title: "Multi-Platform Publishing",
    desc: "Connect Instagram, LinkedIn, Twitter, TikTok, YouTube, Facebook, and more.",
  },
  {
    icon: Zap,
    title: "Smart Scheduling",
    desc: "AI recommends optimal posting times based on your audience's engagement patterns.",
  },
  {
    icon: Sparkles,
    title: "Brand Voice Training",
    desc: "Train AI on your past content to maintain consistent tone across all generated posts.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" />
            Platform Capabilities
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Scale Social
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            See how SocialAI transforms your social media workflow during your personalized demo.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative p-6 rounded-[8px] border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-[8px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
