"use client"

import { useEffect, useState, type ReactNode } from "react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"

export default function ContainerSelect({
  value,
  onChange,
  children,
  className
}:{value: string, onChange: (id: string) => void, children?: ReactNode, className?: string}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading } =
    api.media.list_containers.useQuery({
      limit: 50,
      q: search || undefined,
    })

  const selected = data?.items.find(
    (i) => i.id === value || i.slug === value
  )

  return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              {children ?? <div>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full cursor-pointer justify-between"
                >
                  {selected ? selected.title : "Select media…"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </div>}
            </PopoverTrigger>

            <PopoverContent className="w-[320px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search media…"
                  value={search}
                  onValueChange={setSearch}
                />

                {isLoading && (
                  <div className="p-3 text-sm text-muted-foreground">
                    Searching…
                  </div>
                )}

                <CommandEmpty>
                  No media found.
                </CommandEmpty>

                <CommandGroup>
                  {data?.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => {
                        onChange(
                          item.id,
                        )
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.slug && (
                          <span className="text-xs text-muted-foreground">
                            {item.slug}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
  )
}
