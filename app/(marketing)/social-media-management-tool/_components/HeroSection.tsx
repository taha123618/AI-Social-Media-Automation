"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const platforms = [
  { icon: FaLinkedin, name: "LinkedIn", color: "text-primary" },
  { icon: FaXTwitter, name: "X (Twitter)", color: "text-foreground" },
  { icon: FaInstagram, name: "Instagram", color: "text-accent" },
  { icon: FaYoutube, name: "YouTube", color: "text-red-500" },
  { icon: FaFacebook, name: "Facebook", color: "text-blue-500" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden bg-background">
      {/* Ambient mesh background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-70" />

      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Channel Social Fleet Automation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
            Autonomous Social Fleet <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Scheduling &amp; Dispatch
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-normal mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, schedule, and analyze multi-channel campaigns across LinkedIn, X, Instagram, and YouTube powered by autonomous Mastra agents.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-10 max-w-md mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold px-6 h-11 rounded-lg shadow-md shadow-primary/20">
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-medium px-6 h-11 rounded-lg">
                View Plan Matrix
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-12">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Zero manual posting
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Optimal peak-time algorithms
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Live engagement telemetry
            </span>
          </div>

          {/* Platform chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground shadow-xs"
                >
                  <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                  <span>{p.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
