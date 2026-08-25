"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="bg-card rounded-none border border-border p-6 md:p-8 shadow-none relative">
        <div className="mb-6 text-center border-b border-border pb-4">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-1">
            SECURITY GATEWAY
          </p>
          <h2 className="text-xl font-mono font-black uppercase tracking-tight text-foreground">
            OPERATOR AUTHENTICATION
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Access autonomous multi-agent pipelines and telemetry.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs font-mono text-muted-foreground">
            No operator account yet?{" "}
            <Link
              href="/register"
              className="text-primary font-bold uppercase hover:underline"
            >
              CREATE NEW ACCOUNT
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
