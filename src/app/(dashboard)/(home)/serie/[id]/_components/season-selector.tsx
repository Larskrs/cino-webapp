// app/serie/[id]/season-selector.tsx
"use client"

import * as React from "react"
import { useSelection } from "./media-selection-provider"
import type { MediaSeason } from "@prisma/client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SeasonSelector({
  seasons,
}: {
  seasons: MediaSeason[]
}) {
  const { seasonId, setSeasonId } = useSelection()

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <span className="text-sm font-medium text-primary">
        Velg sesong
      </span>

      <Select
        value={seasonId ?? undefined}
        onValueChange={setSeasonId}
      >
        <SelectTrigger
          className="
            text-text
            border-none
            px-6
            focus:ring-primary
            bg-secondary
            dark:bg-secondary
            hover:bg-primary dark:hover:bg-primary
            data-[state=open]:bg-primary data-[state=open]:text-accent
          "
        >
          <SelectValue placeholder="Velg sesong…" />
        </SelectTrigger>

        <SelectContent
          className="
            bg-background
            border-primary/30
          "
        >
          {seasons.map((season) => (
            <SelectItem
              key={season.id}
              value={season.id}
              className="
                focus:bg-primary focus:text-background
                data-[state=checked]:bg-primary data-[state=checked]:text-background
              "
            >
              {season.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
