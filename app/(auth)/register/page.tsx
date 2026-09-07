"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-xl rounded-2xl shadow-sm border border-border p-6 sm:p-8"
    >
      {/* Header: Project Brand & Register */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-primary/25 mb-3.5">
          S
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Get started with SocialAI
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Start your 14-day free trial • No credit card required.
        </p>
      </div>

      {/* Segment Switcher Tabs */}
      <div className="flex rounded-lg border border-border p-1 mb-6 bg-muted/40">
        <button
          type="button"
          className="flex-1 py-2 text-sm font-medium text-foreground bg-background rounded-md relative text-center shadow-xs cursor-default"
        >
          Sign up
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
        </button>
        <Link
          href="/login"
          className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md text-center"
        >
          Log in
        </Link>
      </div>

      {/* Register Form Core */}
      <RegisterForm />

      {/* Footer Link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium transition-colors duration-200"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
