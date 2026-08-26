"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "@/lib/animations/gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Calendar, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".cta-glow",
      { opacity: 0.3, scale: 0.8 },
      { opacity: 1, scale: 1.2, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" },
    );
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
      <div className="cta-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 lg:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Get started in under 2 minutes</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[0.95]">
            Ready to See{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              SocialAI in Action?
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 24,700+ teams already transforming their social media workflow.
            Book your personalized demo today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#demo-form">
              <Button className="group bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 rounded-[40px] text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-200">
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Demo
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground h-14 px-10 rounded-[40px] text-xl font-bold backdrop-blur-sm"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              No commitment required
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              30-minute session
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Free trial included
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
