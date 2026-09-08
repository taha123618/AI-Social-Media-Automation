"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          newPassword: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to reset password");
      } else {
        toast.success("Password reset successfully!");
        router.push("/login");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Invalid link
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="block">
          <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors duration-200 shadow-xs">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-6 sm:p-8 shadow-sm relative overflow-hidden">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Create a secure password with at least 8 characters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 px-3 pr-10 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 px-3 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors duration-200 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating password...
            </>
          ) : (
            "Update password"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Suspense
        fallback={
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-8 text-center shadow-sm flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </motion.div>
  );
}
