

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
        {/* Hero Skeleton */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge Skeleton */}
          <div className="mx-auto h-9 w-64 animate-pulse rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 mb-10" />
          
          {/* Headline Skeleton */}
          <div className="mx-auto h-20 w-3/4 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 mb-4" />
          <div className="mx-auto h-20 w-1/2 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 mb-8" />

          {/* Sub-headline Skeleton */}
          <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-900 mb-3" />
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-900 mb-12" />

          {/* CTAs Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="h-14 w-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-14 w-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>

        {/* Dashboard Mockup Skeleton */}
        <div className="mt-24 relative mx-auto max-w-5xl">
          <div className="h-96 w-full animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700 mb-4 mx-auto" />
              <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700 mb-2 mx-auto" />
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800 mx-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
