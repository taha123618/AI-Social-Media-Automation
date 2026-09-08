import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary border-primary/25 [a&]:hover:bg-primary/25",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/25 [a&]:hover:bg-destructive/25",
        outline:
          "border-border text-muted-foreground [a&]:hover:bg-muted [a&]:hover:text-foreground",
        solid:
          "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        accent:
          "bg-accent/15 text-accent border-accent/25 [a&]:hover:bg-accent/25",
        ghost:
          "text-muted-foreground [a&]:hover:bg-muted [a&]:hover:text-foreground",
        link:
          "text-primary underline-offset-4 [a&]:hover:underline",
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
