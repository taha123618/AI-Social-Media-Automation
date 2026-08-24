import { Button } from '@/components/ui/button';

export default function Loading() {
   return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
         <main className="mx-auto max-w-7xl px-6 py-10">
            {/* Welcome Section Skeleton */}
            <div className="mb-10">
               <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
               <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Search & Actions Skeleton */}
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <div className="relative flex-1 md:max-w-md">
                  <div className="absolute left-3 top-3 h-5 w-5 rounded bg-slate-300 animate-pulse dark:bg-slate-700" />
                  <div className="h-10 w-full rounded-lg bg-slate-200 p-2 pl-12 animate-pulse dark:bg-slate-800" />
               </div>
               <div className="h-10 w-32 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                     <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                     <div className="mt-4 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                     <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
               ))}
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
               {/* Recent Content Skeleton */}
               <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                     <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                           <div className="flex-1">
                              <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                           </div>
                           <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>
                     ))}
                  </div>
               </div>

               {/* Quick Actions Skeleton */}
               <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-5 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />
                  <div className="space-y-3">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                     ))}
                  </div>

                  <div className="mt-8 rounded-lg bg-slate-100 p-4 dark:bg-slate-800 h-32 animate-pulse" />
               </div>
            </div>

            {/* Bottom Section Skeleton */}
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
               <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                           <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                           <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                           <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                           <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
