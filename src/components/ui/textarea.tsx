"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

function Textarea({
  className,
  maxLength,
  ...props
}: React.ComponentProps<"textarea">) {

  return (
    <div className="w-full space-y-1 relative">
      <textarea
        {...props}
        data-slot="textarea"
        maxLength={maxLength}
        className={cn(
          "text-neutral-600 dark:text-neutral-500 border-input pl-4 pr-12 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />
    </div>
  )
}

export { Textarea }
