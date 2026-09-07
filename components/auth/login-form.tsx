"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { GoogleAuthButton } from "./google-auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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
      {/* Google OAuth Button First */}
      <GoogleAuthButton text="Sign in with Google" />

      {/* Separator */}
      <div className="relative my-6">
        <div className="border-t border-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
          or
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
            className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="h-11 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(Boolean(checked))}
            />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
              Remember for 30 days
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-destructive text-xs font-medium"
          >
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 font-medium text-sm rounded-lg cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in to workspace"
          )}
        </Button>
      </form>
    </div>
  );
}
