export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Actions Skeleton */}
        <div className="mb-10 flex gap-4">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Workflows Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-20 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="space-y-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
