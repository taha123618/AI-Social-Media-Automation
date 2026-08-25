import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-none border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-none select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground border-border shadow-none",
        destructive:
          "bg-destructive/20 text-destructive border-destructive/50 shadow-none",
        outline:
          "border-border text-foreground bg-transparent shadow-none",
        ghost: "border-transparent text-muted-foreground shadow-none",
        lime: "bg-primary/15 text-primary border-primary/40 shadow-none",
        amber: "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-none",
        cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
