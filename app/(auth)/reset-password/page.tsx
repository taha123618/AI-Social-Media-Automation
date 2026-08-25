"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Security tokens/passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update security credentials");
      } else {
        toast.success("Credentials updated. Directing to login console.");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during credential update");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full">
        <div className="bg-card rounded-none p-8 border border-border text-center font-mono">
          <div className="w-10 h-10 bg-destructive/10 border border-destructive/20 rounded-none flex items-center justify-center text-destructive mx-auto mb-4">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold uppercase text-foreground tracking-tight mb-2">
            INVALID SECURITY TOKEN
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            This password reset directive is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full h-10 text-xs font-bold uppercase">
              REQUEST NEW TOKEN
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-card rounded-none p-8 border border-border font-mono">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 bg-secondary border border-border rounded-none flex items-center justify-center text-primary mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold uppercase text-foreground tracking-tight mb-1">
            ESTABLISH NEW CREDENTIALS
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure secure authentication key for operator account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase text-foreground">
              NEW PASSWORD
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-foreground">
              CONFIRM PASSWORD
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-xs font-bold uppercase"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "COMMIT CREDENTIALS"
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-primary transition-none"
            >
              CANCEL AND RETURN TO LOGIN
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
