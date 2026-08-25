"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="relative p-10 md:p-16 rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden text-center">
          {/* Subtle Ambient Mesh */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              LAUNCH YOUR MARKETING FLEET
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight tracking-tight"
            >
              Scale Your Multi-Channel Reach <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                With Deterministic AI
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Join 25,000+ creators, growth operators, and agency fleets who automate content generation, scheduling, and attribution analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold px-6 h-11 rounded-lg shadow-md shadow-primary/20">
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/talk-to-sales" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-medium px-6 h-11 rounded-lg">
                  Schedule Demo
                </Button>
              </Link>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Zero setup fee
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Instant API token clearance
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
