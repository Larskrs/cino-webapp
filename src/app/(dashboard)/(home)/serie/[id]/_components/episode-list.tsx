// episode-list.tsx
"use client"

import { api } from "@/trpc/react"
import { useSelection } from "./media-selection-provider"
import type { MediaEpisode } from "@prisma/client"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function EpisodeList({
  initialEpisodes,
}: {
  initialEpisodes: MediaEpisode[]
}) {
  const { seasonId, episodeId, setEpisodeId } = useSelection()

  const { data } = api.media.get_season.useQuery({ id: seasonId })

  const episodes = data?.episodes

  return (
    <ul className="col-span-3 flex flex-col gap-3">
      {episodes?.map((ep, index) => {
        const active = ep.id === episodeId

        return (
            <button
              onClick={() => setEpisodeId(ep.id)}
              className={cn(
                "group relative h-fit grid grid-cols-[200px_1fr] gap-4 rounded-xl p-2 w-full text-left transition-all",
                "bg-secondary/15 hover:bg-secondary/50",
                active && "bg-secondary hover:bg-secondary"
              )}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                {ep.thumbnail && (
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title}
                    fill
                    className="object-cover rounded-lg bg-background text-transparent"
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">

                  {active && (
                    <span className="text-xs font-medium text-primary">
                      Spilles nå
                    </span>
                  )}
                </div>

                <h3 className="font-normal text-accent leading-tight truncate">
                  {ep.title}
                </h3>

                {ep.description && (
                  <p className="text-sm text-accent/75 line-clamp-2">
                    {ep.description}
                  </p>
                )}
              </div>
            </button>
        )
      })}
    </ul>
  )
}
