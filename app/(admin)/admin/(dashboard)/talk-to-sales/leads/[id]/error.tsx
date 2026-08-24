"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LeadDetailError({
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
      <h2 className="text-2xl font-bold text-foreground mb-2">Lead Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        This lead could not be loaded. It may have been deleted or you may not have access.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/admin/talk-to-sales/leads">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-6">
          Error reference: <code className="text-foreground">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
