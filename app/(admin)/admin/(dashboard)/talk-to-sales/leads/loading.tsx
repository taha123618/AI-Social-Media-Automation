export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
