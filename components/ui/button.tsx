import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 rounded-none text-sm font-semibold whitespace-nowrap transition-none outline-none border border-transparent focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-110 active:brightness-95 border-primary shadow-none",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 border-destructive shadow-none",
        outline:
          "border-border bg-card text-foreground hover:bg-accent hover:border-primary/50 hover:text-foreground shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border shadow-none",
        ghost:
          "hover:bg-accent hover:text-accent-foreground border-transparent shadow-none",
        link: "text-primary underline-offset-4 hover:underline border-transparent shadow-none",
        tactical: "bg-card text-primary border-primary hover:bg-primary hover:text-primary-foreground shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 text-xs uppercase tracking-wider",
        xs: "h-6 gap-1 px-2 text-[10px] uppercase tracking-wider has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-2.5 text-xs uppercase tracking-wider has-[>svg]:px-2",
        lg: "h-10 px-6 text-sm uppercase tracking-wider has-[>svg]:px-4 font-bold",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
