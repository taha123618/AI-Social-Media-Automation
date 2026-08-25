import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
   return (
     <div className="min-h-screen bg-background text-foreground">
        {/* Navbar Skeleton */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center border-b border-border bg-card">
           <div className="max-w-7xl w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Skeleton className="w-8 h-8 rounded-none" />
                 <Skeleton className="w-24 h-5 rounded-none" />
              </div>
              <div className="hidden md:flex items-center gap-6">
                 <Skeleton className="w-16 h-3 rounded-none" />
                 <Skeleton className="w-16 h-3 rounded-none" />
                 <Skeleton className="w-16 h-3 rounded-none" />
                 <Skeleton className="w-16 h-3 rounded-none" />
              </div>
              <div className="flex items-center gap-3">
                 <Skeleton className="w-7 h-7 rounded-none" />
                 <Skeleton className="w-24 h-8 rounded-none" />
              </div>
           </div>
        </header>

        <main className="pt-24 pb-20 px-4">
           <div className="container mx-auto max-w-6xl space-y-8">
              {/* Hero Section Skeleton */}
              <div className="space-y-4">
                 <Skeleton className="w-36 h-5 rounded-none" />
                 <Skeleton className="h-10 w-2/3 rounded-none" />
                 <Skeleton className="h-4 w-1/2 rounded-none" />
                 <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="w-36 h-9 rounded-none" />
                    <Skeleton className="w-36 h-9 rounded-none" />
                 </div>
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Skeleton className="h-48 w-full rounded-none" />
                 <Skeleton className="h-48 w-full rounded-none" />
                 <Skeleton className="h-48 w-full rounded-none" />
              </div>
           </div>
        </main>
     </div>
   );
}
