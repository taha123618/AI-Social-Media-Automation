export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-16 animate-pulse rounded bg-muted/50 mb-1" />
                  <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
