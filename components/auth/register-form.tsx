"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "./google-auth-button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const [name, setName] = useState("");
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
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast.error(result.error.message || "Registration failed");
        setError(result.error.message || "Registration failed");
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred");
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-semibold text-foreground">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Sarah Connor"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-foreground">
            Work Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="sarah@company.io"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-foreground">
            Create Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="h-10"
          />
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
          className="w-full h-10 rounded-lg text-sm font-semibold mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create Organization Workspace"
          )}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">
            Or register with
          </span>
        </div>
      </div>

      <GoogleAuthButton />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have a workspace?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
