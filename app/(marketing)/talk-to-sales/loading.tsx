
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto h-9 w-64 animate-pulse rounded-full border border-border bg-muted mb-10" />
          <div className="mx-auto h-20 w-3/4 animate-pulse rounded-[8px] bg-muted mb-4" />
          <div className="mx-auto h-20 w-1/2 animate-pulse rounded-[8px] bg-muted mb-8" />
          <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-muted/50 mb-3" />
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded bg-muted/50 mb-12" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="h-14 w-48 animate-pulse rounded-[40px] bg-muted" />
            <div className="h-14 w-40 animate-pulse rounded-[40px] bg-muted/50" />
          </div>
        </div>

        <div className="mt-24 relative mx-auto max-w-5xl">
          <div className="h-96 w-full animate-pulse rounded-[8px] border border-border bg-card" />
        </div>
      </main>
    </div>
  );
}
