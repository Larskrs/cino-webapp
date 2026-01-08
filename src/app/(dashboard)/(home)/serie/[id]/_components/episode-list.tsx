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
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
      {episodes?.map((ep, index) => {
        const active = ep.id === episodeId

        return (
            <button
              onClick={() => setEpisodeId(ep.id)}
              className={cn(
                "group relative h-fit flex flex-col gap-1 rounded-xl w-full text-left transition-all",
              )}
            >
              {/* Thumbnail */}
              <div className={cn("relative aspect-video p-2",
                active ? "group-hover:border-secondary" : ""
              )}>
                {ep.thumbnail && (
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title}
                    fill
                    className={cn("object-cover rounded-lg bg-background text-transparent",
                      active ? "outline-2 outline-offset-2 outline-primary" : ""
                    )}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 min-w-0">

                <h3 className="font-normal text-accent text-lg line-clamp-1">
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
