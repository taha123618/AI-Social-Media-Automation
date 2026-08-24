export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-10">
          <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="space-y-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-20 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
