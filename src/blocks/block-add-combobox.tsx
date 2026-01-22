"use client"

import { useState } from "react"
import { nanoid } from "nanoid"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

import { ChevronsUpDown, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { BLOCK_SCHEMAS, type BlockType } from "./registry"
import type { BlockInstance } from "./types"

export function BlockAddCombobox({
  onAdd,
}: {
  onAdd: (block: BlockInstance) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const blockTypes = Object.keys(BLOCK_SCHEMAS) as BlockType[]

  const filtered = blockTypes.filter((type) =>
    type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Add block…
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search blocks…"
            value={search}
            onValueChange={setSearch}
          />

          <CommandEmpty>No blocks found.</CommandEmpty>

          <CommandGroup>
            {filtered.map((type) => {
              const schema = BLOCK_SCHEMAS[type]

              return (
                <CommandItem
                  key={type}
                  value={type}
                  onSelect={() => {
                    onAdd({
                      id: nanoid(),
                      type,
                      data: schema.defaults,
                    })
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  <Plus className="mr-2 h-4 w-4 opacity-60" />

                  <div className="flex flex-col">
                    <span className="capitalize">
                      {schema.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Block type
                    </span>
                  </div>

                  <Check className="ml-auto h-4 w-4 opacity-0" />
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
