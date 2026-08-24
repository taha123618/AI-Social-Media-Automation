"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to send reset email");
      } else {
        toast.success("Password reset email sent!");
        setIsSubmitted(true);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none p-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10"
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#2D46FF] mx-auto mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mb-3">
                  Reset Password
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold">
                  Enter your email to receive a recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight ml-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#2D46FF]/10 focus:border-[#2D46FF] transition-all text-slate-950 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-[#2D46FF] hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to log in
                  </Link>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 relative z-10"
            >
              <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mb-4">
                Check Email
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                We've sent a recovery link to:<br />
                <span className="text-slate-900 dark:text-white font-black">{email}</span>
              </p>

              <div className="space-y-4">
                <Link href="/login" className="block">
                  <Button className="w-full h-16 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-lg transition-all active:scale-[0.98]">
                    Go to Login
                  </Button>
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-[#2D46FF] dark:hover:text-blue-500 transition-colors"
                >
                  Didn't receive email? Try again
                </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}
