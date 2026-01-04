"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

function Switch({
  className,
  thumbClassName,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  thumbClassName?: string
}) {
  const toggle = React.useCallback(() => {
    if (disabled) return
    onCheckedChange?.(!checked)
  }, [checked, onCheckedChange, disabled])

  return (
    <motion.div
      data-slot="switch-hit-zone"
      onClick={toggle}
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      initial={false}
      variants={{
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <SwitchPrimitive.Root
        data-slot="switch"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(
          "peer relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full",
          "border border-transparent shadow-xs outline-none transition-colors",
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          "dark:data-[state=unchecked]:bg-input/80",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "group-hover:ring-2 group-hover:ring-primary/30",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            data-slot="switch-thumb"
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className={cn(
              "pointer-events-none block size-4 rounded-full",
              "bg-background ring-0",
              "dark:data-[state=unchecked]:bg-foreground",
              "dark:data-[state=checked]:bg-primary-foreground",
              "data-[state=checked]:translate-x-[calc(100%-2px)]",
              "data-[state=unchecked]:translate-x-[1px]",
              thumbClassName
            )}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    </motion.div>
  )
}

export { Switch }
