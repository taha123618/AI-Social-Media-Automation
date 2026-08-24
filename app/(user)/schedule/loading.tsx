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

        {/* Calendar Skeleton */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Calendar Grid Skeleton */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Skeleton */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="bg-slate-50 p-2 min-h-[80px] dark:bg-slate-900">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
