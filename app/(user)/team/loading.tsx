export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Team Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Team Members Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Invitations Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
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
