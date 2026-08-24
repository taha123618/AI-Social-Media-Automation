"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Settings Error</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Failed to load settings. Please try again.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-6">
          Error reference: <code className="text-foreground">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
