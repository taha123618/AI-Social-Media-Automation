export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="h-4 w-20 animate-pulse rounded bg-muted mb-3" />
            <div className="h-8 w-12 animate-pulse rounded bg-muted mb-2" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted/50" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-8 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
