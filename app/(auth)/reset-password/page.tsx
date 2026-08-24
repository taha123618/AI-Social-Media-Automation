"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token!,
          newPassword: password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to reset password");
      } else {
        toast.success("Password reset successfully!");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mb-4">
            Invalid Link
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-10">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full h-16 bg-[#2D46FF] hover:bg-blue-600 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98]">
              Request New Link
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none p-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="mb-10 text-center relative z-10">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#2D46FF] mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mb-3">
            Set Password
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            Create a secure password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight ml-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#2D46FF]/10 focus:border-[#2D46FF] transition-all text-slate-950 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight ml-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
              "Update Password"
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

        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}
