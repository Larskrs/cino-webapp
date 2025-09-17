"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

function Textarea({
  className,
  maxLength,
  ...props
}: React.ComponentProps<"textarea">) {
  const [value, setValue] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  const remaining = maxLength ? maxLength - value.length : null
  const progress =
    maxLength && maxLength > 0 ? Math.min((value.length / maxLength) * 100, 100) : 0

  return (
    <div className="w-full space-y-1 relative">
      <textarea
        {...props}
        data-slot="textarea"
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(
          "border-input pl-4 pr-8 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />

      <AnimatePresence>
        {maxLength && (
          <motion.div
            key="char-counter"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 absolute top-2 right-2 flex gap-4 items-center"
          >
            {/* Remaining text */}
            <div
              className={cn(
                "text-xs text-muted-foreground w-1/3 flex justify-end",
                remaining !== null && remaining <= 10
                  ? "text-destructive font-medium"
                  : ""
              )}
            >
              {remaining}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Textarea }
