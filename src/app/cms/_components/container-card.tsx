"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RouterOutputs } from "@/trpc/react"

type ContainerWithSeasons = RouterOutputs["media"]["list_containers"]["items"][0]

type ContainerCardProps = {
  container: ContainerWithSeasons
  className?: string
}

export default function ContainerCard({ container, className }: ContainerCardProps) {
  const image = container.poster ?? container.thumbnail ?? container.banner
  const latestEpisode = container.seasons?.[0]?.episodes?.[0]
  const airDateLabel = formatExactDateTime(latestEpisode?.airDate)

  return (
    <li className={cn("list-none", className)}>
      <Link
        href={`/cms/${container.slug ?? container.id}`}
        className={cn(
          "group flex w-full gap-4 rounded-xl border bg-card p-2 transition hover:bg-accent",
        )}
      >
        {/* Image */}
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
          {image ? (
            <Image
              src={image}
              alt={container.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Play className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium leading-tight">
            {container.title}
          </h4>

          {container.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {container.description}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {container._count?.seasons !== undefined && (
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {container._count.seasons} sesong{container._count.seasons === 1 ? "" : "er"}
              </span>
            )}

            {airDateLabel && (
              <>
                <span>·</span>
                <span className="font-mono">{airDateLabel}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
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
