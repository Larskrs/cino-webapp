"use client"

import Image from "next/image"
import { Play, Radio, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEpisodeRef } from "@/lib/episode"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type EpisodeCardProps = {
  episode: any
  compact?: boolean
  expanded?: boolean
  showContext?: boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function EpisodeCard({
  episode,
  compact = false,
  expanded = false,
  showContext = false,
  className,
}: EpisodeCardProps) {
  const container = episode.season?.container
  const seasonNumber = episode.season?.seasonNumber
  const episodeNumber = episode.episodeNumber

  const ref = formatEpisodeRef(seasonNumber, episodeNumber)

  const airDateLabel = formatExactDateTime(episode.airDate)

  return (
    <li className="list-none">
      <div
        className={cn(
          "group flex w-full gap-4 rounded-xl border bg-card p-1 transition",
          "hover:bg-accent cursor-pointer",
          compact && "items-center",
          className
        )}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Thumbnail                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-muted",
            compact ? "h-20 w-35" : "h-20 w-36"
          )}
        >
            {/* Duration */}
            {episode.durationSec && (
              <div className="absolute px-1 py-0.5 rounded-sm bg-background/75 text-primary backdrop-blur-sm text-[10px] left-1 top-1 z-1 flex shrink-0 items-center gap-1">
                {formatDuration(episode.durationSec)}
              </div>
            )}
          {episode.thumbnail ? (
            <Image
              src={episode.thumbnail}
              alt={episode.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Play className="h-5 w-5" />
            </div>
          )}

          {episode.isLive && (
            <div className="absolute left-1 top-1 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
              <Radio className="h-3 w-3" />
              LIVE
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Content                                                             */}
        {/* ------------------------------------------------------------------ */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Title */}
              <h4 className="truncate font-medium leading-tight">
                {episode.title}
              </h4>

              {/* Admin context */}
              {showContext && container && (
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {container.title}
                  </span>

                  {ref && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{ref}</span>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              {(expanded || !compact) && episode.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {episode.description}
                </p>
              )}

              {/* Exact air date */}
              {airDateLabel && (
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  {airDateLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m} min` : `${m}:${s.toString().padStart(2, "0")}`
}

/**
 * Formats date as: 29.12.25 22:18
 */
function formatExactDateTime(date?: string | Date | null) {
  if (!date) return null

  const d = new Date(date)

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = String(d.getFullYear()).slice(-2)

  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${day}.${month}.${year} ${hours}:${minutes}`
}
