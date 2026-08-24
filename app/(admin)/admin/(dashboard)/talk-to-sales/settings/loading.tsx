export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-36 animate-pulse rounded bg-muted" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted/50" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted/50" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ))}
      <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
