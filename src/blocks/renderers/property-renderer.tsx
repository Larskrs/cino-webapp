// blocks/properties/renderers.tsx
"use client"

import type { JSX } from "react"
import type { BlockProperty, BlockSchema } from "../types"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PropertyRendererProps = {
  propKey: string
  value: any
  prop: BlockSchema<any>["properties"][string]
  onChange: (value: any) => void
}

export const propertyRenderers: Record<
  string,
  (props: PropertyRendererProps) => JSX.Element | null
> = {
  text: ({ propKey, value, prop, onChange }) => (
    <div key={propKey}>
      <Label>{prop.label}</Label>
      <Input
        className="w-full border rounded px-2 py-1"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        />
    </div>
  ),
  


  container: ({ propKey, value, onChange }) => (
    <div key={propKey}>
      {/* reuse your ContainerSelect here */}
      {/* example placeholder */}
      <button onClick={() => onChange("container-id")}>
        Select container
      </button>
    </div>
  ),

  
  select: ({ propKey, value, prop, onChange }) => (
    <div key={propKey} className="space-y-1">
      <Label>{prop.label}</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {(prop as {type: string, label: string, options: string[]})?.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),

  boolean: ({ propKey, value, prop, onChange }) => (
    <div
      key={propKey}
      className="flex items-center justify-between gap-2"
    >
      <Label>{prop.label}</Label>
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(v) => onChange(Boolean(v))}
      />
    </div>
  ),

  // future:
  // number: …
  // boolean: …
  // color: …
}
