import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
   return (
     <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {/* Navbar Skeleton */}
        <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-center">
           <div className="max-w-7xl w-full flex items-center justify-between px-6 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                 <Skeleton className="w-10 h-10 rounded-xl" />
                 <Skeleton className="w-24 h-6" />
              </div>
              <div className="hidden md:flex items-center gap-8">
                 <Skeleton className="w-16 h-4" />
                 <Skeleton className="w-16 h-4" />
                 <Skeleton className="w-16 h-4" />
                 <Skeleton className="w-16 h-4" />
              </div>
              <div className="flex items-center gap-4">
                 <Skeleton className="w-8 h-8 rounded-md" />
                 <Skeleton className="w-24 h-10 rounded-xl" />
              </div>
           </div>
        </header>

        <main className="pt-32 pb-40 px-4">
           <div className="container mx-auto max-w-6xl">
              {/* Hero Section Skeleton */}
              <div className="text-center space-y-8 mb-20">
                 <div className="flex justify-center">
                    <Skeleton className="w-48 h-6 rounded-full" />
                 </div>
                 <div className="space-y-4 max-w-4xl mx-auto flex flex-col items-center">
                    <Skeleton className="h-12 md:h-16 w-3/4" />
                    <Skeleton className="h-12 md:h-16 w-1/2" />
                 </div>
                 <div className="max-w-2xl mx-auto flex flex-col items-center">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                 </div>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Skeleton className="w-48 h-14 rounded-2xl" />
                    <Skeleton className="w-48 h-14 rounded-2xl" />
                 </div>
              </div>

              {/* Mockup Skeleton */}
              <div className="relative mx-auto max-w-6xl rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl aspect-[16/10] overflow-hidden p-4">
                 <div className="w-full h-full rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 flex flex-col">
                    <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-4">
                       <Skeleton className="w-4 h-4 rounded-full" />
                       <Skeleton className="w-4 h-4 rounded-full" />
                       <Skeleton className="w-4 h-4 rounded-full" />
                       <div className="flex-1" />
                       <Skeleton className="w-32 h-6" />
                    </div>
                    <div className="flex-1 flex p-6 gap-6">
                       <div className="w-48 space-y-4 hidden lg:block">
                          <Skeleton className="w-full h-10 rounded-lg" />
                          <Skeleton className="w-full h-10 rounded-lg" />
                          <Skeleton className="w-full h-10 rounded-lg" />
                          <Skeleton className="w-full h-10 rounded-lg" />
                       </div>
                       <div className="flex-1 space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <Skeleton className="aspect-video rounded-xl" />
                             <Skeleton className="aspect-video rounded-xl" />
                             <Skeleton className="aspect-video rounded-xl" />
                          </div>
                          <Skeleton className="w-full h-40 rounded-xl" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </main>
     </div>
  );
}
