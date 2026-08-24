export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded bg-muted/50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-muted mb-3" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted mb-2" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted/50" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-muted mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
