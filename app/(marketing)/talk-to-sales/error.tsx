"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TalkToSalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-3">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an error loading this page. Please try again or contact support.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground mt-8">
            Error reference: <code className="text-foreground">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
