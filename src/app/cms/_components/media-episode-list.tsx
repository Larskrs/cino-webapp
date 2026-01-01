"use client"

import { api } from "@/trpc/react"
import { cn } from "@/lib/utils"
import EpisodeCard from "./episode-card"

type AdminMediaEpisodeListProps = {
  className?: string
  compact?: boolean
}

export function AdminMediaEpisodeList({
  className,
  compact = false,
}: AdminMediaEpisodeListProps) {
  const [episodes] =
    api.media.admin_list_recent_episodes.useSuspenseQuery()

  if (!episodes.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No episodes created yet
      </div>
    )
  }

  return (
    <ul className={cn("flex flex-col min-w-100 gap-2", className)}>
      {episodes.map((ep) => (
        <EpisodeCard
          key={ep.id}
          episode={ep}
          compact={compact}
          showContext // 👈 admin-only UX
        />
      ))}
    </ul>
  )
}
