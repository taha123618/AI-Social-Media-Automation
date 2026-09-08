"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Reset your password
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Enter your email address and we&apos;ll send you a recovery link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                        Sending reset link...
                      </>
                    ) : (
                      "Send reset link"
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
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                  Check your inbox
                </h1>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  We&apos;ve sent a password reset link to <br />
                  <span className="font-semibold text-foreground">{email}</span>
                </p>

                <div className="space-y-3">
                  <Link href="/login" className="block">
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors duration-200 shadow-xs">
                      Return to sign in
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Didn&apos;t receive email? Click to resend
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  );
}
