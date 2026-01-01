// video-player.tsx
"use client"

import type { MediaEpisode } from "@prisma/client"
import { useSelection } from "./media-selection-provider"
import { api } from "@/trpc/react"
import VideoPlayer from "@/app/_components/hls-video"

export default function EpisodePlayer({ initialEpisode }: {initialEpisode: MediaEpisode}) {
  const { episodeId } = useSelection()
  const { data: episode, isLoading } = api.media.get_episode.useQuery({id: episodeId ?? initialEpisode.id})
  const ep = isLoading ? initialEpisode : episode

  return (
    <div className=" max-w-[1920px] mx-auto p-4">
      {ep?.videoSrc && ep?.thumbnail ? <VideoPlayer
        key={episodeId ?? initialEpisode.id}
        className="bg-background rounded-md mb-4 w-full max-h-[calc(100dvh-var(--nav-height)-8rem)] min-h-auto aspect-video h-full"
        src={ep?.videoSrc}
        poster={ep?.thumbnail}
        controls
        />: <div className="bg-black/50 rounded-md mb-4 w-full max-h-[calc(100dvh-var(--nav-height)-8rem)] min-h-auto aspect-video h-full" />}
        <div className="bg-secondary/25 rounded-md min-h-20"></div>
    </div>
  )
}
