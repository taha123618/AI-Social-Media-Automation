"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 p-8 sm:p-10 border border-border/80 relative overflow-hidden">
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-1.5">
            Create Workspace
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Deploy your 14-day free trial on our autonomous AI fleet.
          </p>
        </div>

        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground px-4 leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-foreground hover:underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-foreground hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </motion.div>
  );
}
