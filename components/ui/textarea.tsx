import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border border-input bg-background/80 px-3.5 py-2.5 text-sm shadow-xs transition-all outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-card/50 dark:aria-invalid:ring-destructive/40",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
