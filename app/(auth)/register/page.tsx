"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none p-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="mb-10 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mb-3"
          >
            Join SocialAI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-bold"
          >
            Start automating your growth today.
          </motion.p>
        </div>

        <RegisterForm />

        <div className="mt-10 text-center relative z-10">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#2D46FF] dark:text-blue-500 hover:text-blue-600 transition-colors"
            >
              Log in to Account
            </Link>
          </p>
        </div>

        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 px-6 leading-relaxed"
      >
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors underline decoration-slate-200 dark:decoration-slate-800 underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors underline decoration-slate-200 dark:decoration-slate-800 underline-offset-4">
          Privacy Policy
        </Link>
      </motion.p>
    </motion.div>
  );
}
