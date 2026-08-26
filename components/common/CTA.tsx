"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="relative p-10 md:p-16 rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden text-center">
          {/* Ambient Mesh — Electric Violet + Indigo radial glows */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/8 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <Zap className="w-3 h-3" />
              LAUNCH YOUR MARKETING FLEET
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted-foreground text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Join 25,000+ creators, growth operators, and agency fleets who automate content generation, scheduling, and attribution analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold px-7 h-11 rounded-lg shadow-md shadow-primary/20">
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

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
              {[
                "Zero setup fee",
                "Instant API token clearance",
                "Cancel anytime",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
