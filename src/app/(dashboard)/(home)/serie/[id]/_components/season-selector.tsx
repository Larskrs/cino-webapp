// app/serie/[id]/season-selector.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useSelection } from "./media-selection-provider"
import type { MediaSeason } from "@prisma/client"

type Season = {
  id: string
  title: string
}

export default function SeasonSelector({
  seasons,
}: {
  seasons: MediaSeason[]
}) {
  const { seasonId, setSeasonId } = useSelection()

  return (
    <ul className="flex flex-col gap-1">

      <h1 className="text-primary">Velg Sesong</h1>

      {seasons.map((season) => {
        const active = season.id === seasonId

        return (
          <li key={season.id}>
            <button
              onClick={() => setSeasonId(season.id)}
              className={cn(
                "w-full cursor-pointer text-left rounded-sm px-4 py-2 transition-colors",
                active
                  ? "bg-primary text-background"
                  : "bg-primary/25 text-primary hover:bg-primary hover:text-background"
              )}
            >
              {season.title}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
