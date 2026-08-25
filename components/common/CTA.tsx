"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-background border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="p-8 md:p-12 rounded-none bg-card border border-border text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            DISPATCH INITIATIVE
          </p>

          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground mb-4 leading-tight tracking-tight">
            READY TO DEPLOY AUTONOMOUS <br />
            <span className="text-primary">SOCIAL MEDIA AUTOMATION?</span>
          </h2>

          <p className="text-xs md:text-sm font-mono text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of high-velocity operators running automated multi-agent content pipelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                INITIALIZE 14-DAY FLEET TRIAL
              </Button>
            </Link>
            <Link href="/talk-to-sales">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                CONTACT ENTERPRISE OPS
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-muted-foreground font-mono text-xs">
            <span>✓ ZERO HARDWARE REQUIRED</span>
            <span className="text-primary">•</span>
            <span>✓ CANCEL ANYTIME</span>
            <span className="text-primary">•</span>
            <span>✓ FULL REST / WEBHOOK API</span>
          </div>
        </div>
      </div>
    </section>
  );
}
