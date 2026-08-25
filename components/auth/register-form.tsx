"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "./google-auth-button";
import { Loader2 } from "lucide-react";

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
          <label htmlFor="name" className="text-xs font-mono uppercase font-bold text-foreground tracking-wider">
            OPERATOR / ORGANIZATION NAME
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe or Apex Corp"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-mono uppercase font-bold text-foreground tracking-wider">
            OPERATOR EMAIL
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="operator@domain.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-mono uppercase font-bold text-foreground tracking-wider">
            PASSWORD
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/40 text-destructive text-xs font-mono">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
          ) : (
            "INITIALIZE ACCOUNT & WORKSPACE"
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase tracking-widest">
            <span className="px-2 bg-card text-muted-foreground">OR FEDERATED ACCESS</span>
          </div>
        </div>

        <GoogleAuthButton />
      </div>
    </div>
  );
}
