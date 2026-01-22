"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"

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

import { ArrowLeft, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import Image from "next/image"

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
  children: ReactNode
}

type Step = "container" | "season" | "episode"

export default function EpisodeSelect({
  value,
  onChange,
  className,
  children
}: Props) {
  const [containerId, setContainerId] = useState("")
  const [seasonId, setSeasonId] = useState("")
  
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")


  /* -------------------- Queries -------------------- */

  const containers = api.media.list_containers.useQuery({
    limit: 50,
    q: search || undefined,
  })

  const seasons = api.media.list_seasons.useQuery(
    { containerId },
    { enabled: !!containerId }
  )

  const episodes = api.media.list_episodes.useQuery(
    { seasonId },
    { enabled: !!seasonId }
  )

  /* -------------------- Label -------------------- */

  const label = useMemo(() => {
    if (value && episodes.data) {
      return episodes.data.find(e => e.id === value)?.title
    }
    return "Select episode…"
  }, [value, episodes.data])

  /* -------------------- Back -------------------- */

  function goBack() {
    setSearch("")
    if (seasonId) {
      setSeasonId("")
    } else if (containerId) {
      setContainerId("")
    }
  }

  /* -------------------- Render -------------------- */

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? <div>
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between", className)}
          >
            {label}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </div>}
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0">
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 border-b px-2 py-1">
            {containerId && (
              <Button
                size="icon"
                variant="ghost"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <CommandInput
              // placeholder={
              //   step === "container"
              //     ? "Select container…"
              //     : step === "season"
              //     ? "Select season…"
              //     : "Select episode…"
              // }
              value={search}
              onValueChange={setSearch}
            />
          </div>

          <CommandEmpty>No results. {containerId}</CommandEmpty>

          {/* -------- Containers -------- */}
          {!containerId && !seasonId && (
            <CommandGroup>
              {containers.data?.items.map(c => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    setContainerId(c.id)
                  }}
                >
                  {c.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* -------- Seasons -------- */}
          {containerId && !seasonId && (
            <CommandGroup>
              {seasons.data?.map(s => (
                <CommandItem
                  key={s.id}
                  value={s.id}
                  onSelect={() => {
                    setSearch("")
                    setSeasonId(s.id)
                  }}
                >
                  {s.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* -------- Episodes -------- */}
          {containerId && seasonId && (
            <CommandGroup>
              {episodes.data?.map(e => (
                <CommandItem
                  key={e.id}
                  value={e.id}
                  onSelect={() => {
                    onChange(e.id)
                    setOpen(false)
                  }}
                >
                  <Image
                    alt={e.title}
                    src={e.thumbnail ?? ""}
                    width={64}
                    height={38}
                    className="aspect-video object-cover rounded-sm"
                  />
                  {e.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
