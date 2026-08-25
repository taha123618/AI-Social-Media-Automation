import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-secondary border border-border/40 animate-pulse rounded-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
