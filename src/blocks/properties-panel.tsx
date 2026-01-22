// blocks/properties/properties-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { BLOCK_SCHEMAS } from "./registry"
import { propertyRenderers } from "./renderers/property-renderer"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import type { ReactNode } from "react"

export function PropertiesPanel({
  block,
  onSave,
  children,
}: {
  block: any
  onSave: (data: any) => void
  children?: ReactNode
}) {
  const schema =
    BLOCK_SCHEMAS[block.type as keyof typeof BLOCK_SCHEMAS]

  if (!schema) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Settings className="h-4 w-4" />
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {block.type} properties
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(schema.properties).map(([key, prop]) => {
            const render = propertyRenderers[prop.type]
            if (!render) return null

            return render({
              propKey: key,
              prop,
              value: block.data[key],
              onChange: (value) =>
                onSave({
                  ...block.data,
                  [key]: value,
                }),
            })
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
