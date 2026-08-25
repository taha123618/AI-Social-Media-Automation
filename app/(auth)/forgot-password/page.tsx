"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        toast.error(result.error || "Failed to send recovery directive");
      } else {
        toast.success("Security recovery dispatch emitted");
        setIsSubmitted(true);
      }
    } catch (err: any) {
      toast.error("An unexpected security error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-card rounded-none p-8 border border-border relative overflow-hidden font-mono">
        {!isSubmitted ? (
          <div>
            <div className="mb-6 text-center">
              <div className="w-10 h-10 bg-secondary border border-border rounded-none flex items-center justify-center text-primary mx-auto mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold uppercase text-foreground tracking-tight mb-1">
                ACCESS RECOVERY DIRECTIVE
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your authorized operator email to receive recovery instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase text-foreground">
                  OPERATOR EMAIL
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@system.io"
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
                  "EMIT RECOVERY LINK"
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  RETURN TO OPERATOR LOGIN
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-none flex items-center justify-center text-primary mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold uppercase text-foreground tracking-tight mb-2">
              DISPATCH EMITTED
            </h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Recovery instructions have been transmitted to:<br />
              <span className="text-primary font-bold">{email}</span>
            </p>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full h-10 text-xs font-bold uppercase">
                  PROCEED TO LOGIN
                </Button>
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-muted-foreground hover:text-primary transition-none"
              >
                DID NOT RECEIVE DIRECTIVE? RE-TRANSMIT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
