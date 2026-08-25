"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="bg-card rounded-none border border-border p-6 md:p-8 shadow-none relative">
        <div className="mb-6 text-center border-b border-border pb-4">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-1">
            ONBOARDING WORKSPACE
          </p>
          <h2 className="text-xl font-mono font-black uppercase tracking-tight text-foreground">
            INITIALIZE NEW OPERATOR
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Create an organization and deploy free AI automation credits.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs font-mono text-muted-foreground">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-primary font-bold uppercase hover:underline"
            >
              OPERATOR LOG IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
