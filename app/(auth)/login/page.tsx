"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
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
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in to manage your autonomous social fleet.
          </p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground px-4 leading-relaxed">
        By signing in, you agree to our{" "}
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
