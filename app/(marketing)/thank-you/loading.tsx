export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-20">
      <div className="mx-auto max-w-lg px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted border border-border animate-pulse mx-auto mb-6" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted mx-auto mb-4" />
        <div className="h-4 w-full animate-pulse rounded bg-muted/50 mx-auto mb-2" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted/50 mx-auto mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="h-11 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-36 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
