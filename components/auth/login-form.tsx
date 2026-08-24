"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { GoogleAuthButton } from "./google-auth-button";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        if (result.error.code === "INVALID_CREDENTIALS") {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(result.error.message || "Login failed");
        }
        setError(result.error.message || "Login failed");
      } else {
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight ml-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john.doe@example.com"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#2D46FF]/10 focus:border-[#2D46FF] transition-all text-slate-950 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">
              Login Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-black text-[#2D46FF] dark:text-blue-500 hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#2D46FF]/10 focus:border-[#2D46FF] transition-all text-slate-950 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-red-500 text-xs font-bold ml-1"
          >
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-[#2D46FF] hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="mt-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-100 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.2em]">
            <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600">or continue with</span>
          </div>
        </div>

        <GoogleAuthButton />
      </div>
    </div>
  );
}
