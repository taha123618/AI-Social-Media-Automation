import * as motion from "framer-motion/client";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { PricingContent } from "./PricingContent";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PricingHeader() {
  return (
    <section className="py-20 px-4 text-center relative z-10">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4"
            >
              PLANS &amp; SCALING TIERS
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight"
            >
              Predictable Plans for <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Autonomous Growth Fleets
              </span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-base md:text-lg text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed"
            >
              Transparent pricing with instant API access. Every paid tier includes a 14-day risk-free trial.
            </motion.p>
          </div>

          {/* Interactive Pricing Toggle + Cards */}
          <div className="pb-12">
            <PricingContent />
          </div>

          {/* Enterprise CTA */}
          <motion.div variants={fadeIn} className="mt-8 text-center border-t border-border/60 pt-8">
            <p className="text-muted-foreground text-xs md:text-sm font-medium mb-3">
              Need custom seat configurations, dedicated VPC instance, or tailored SLA?
            </p>
            <Link
              href="/talk-to-sales"
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all"
            >
              <span>Talk to Enterprise Architecture Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
