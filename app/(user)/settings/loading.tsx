export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-10">
          <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
            {['Profile', 'Business', 'API Keys', 'Webhooks', 'Notifications'].map((tab) => (
              <div key={tab} className="h-10 w-24 animate-pulse rounded-t-lg bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>

        {/* Settings Content Skeleton */}
        <div className="space-y-6">
          {/* Form Sections */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
