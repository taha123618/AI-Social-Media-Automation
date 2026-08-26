"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import AppLogo from "@/components/common/AppLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors selection:bg-primary/20 selection:text-primary">
      {/* Mesh ambient backdrop */}
      <div className="absolute inset-0 -z-10 pointer-events-none mesh-gradient opacity-50 dark:opacity-100" />

      {/* Primary violet glow — top left */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/8 dark:bg-primary/12 blur-[120px] rounded-full pointer-events-none -z-0" />
      {/* Accent indigo glow — bottom right */}
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/8 dark:bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-0" />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <AppLogo />
        </motion.div>

        <div className="w-full max-w-[440px]">
          {children}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground"
        >
          Secure Cloud Infrastructure • SocialAI v2.0
        </motion.p>
      </div>
    </div>
  );
}