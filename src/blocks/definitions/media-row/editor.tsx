"use client"

import { Plus, Trash } from "lucide-react"
import { type MediaRowData } from "./schema"
import ContainerSelect from "@/components/ui/container-select"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import Image from "next/image"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import MediaSelect from "@/components/ui/media-select"

export function MediaRowEditor({
  data,
  onChange,
}: {
  data: MediaRowData
  onChange: (patch: Partial<MediaRowData>) => void
}) {
  const selected = data.episodes ?? []

  const { data: episodes } = api.media.get_episodes.useQuery({
    select: selected,
  })

  function updateContainer(index: number, value: string) {
    if (selected.includes(value)) { return }
    const next = [...selected]
    next[index] = value
    onChange({ episodes: next })
  }

  function addContainer(id: string) {
    if (selected.includes(id)) { return }
    onChange({ episodes: [...selected, id] })
  }

  function remContainer(id: string) {
    onChange({ episodes: selected.filter(c => c !== id) })
  }

  const cardClass = data.posterType === "poster"
    ? "aspect-[2/3] max-w-48 w-48"
    : "aspect-video max-w-64 w-64"
  const cardContainerClass = data.posterType === "poster"
    ? "max-w-48 w-48"
    : "max-w-64 w-64"
  
  return (


    <div className={cn("p-2 flex gap-3 overflow-x-auto", data.showTitle ? "pb-8" : "")}>
        {selected.map((epId, index) => {

          const ep = episodes?.find((e) => e.id === epId)
          const container = ep?.season.container

          return (
            <div
              key={epId}
              className={cn("relative shrink-0", cardContainerClass)}
            >
              <div className={cn("relative rounded-md overflow-hidden flex flex-col", cardClass)}>
                <Button
                  onClick={() => remContainer(epId)}
                  variant={"opposite"}
                  className="absolute top-2 right-2 z-1 text-xs size-8 bg-background text-primary rounded"
                  >
                  <Trash className="size-4" />
                </Button>

                <MediaSelect
                  value={epId}
                  onChange={(id) => updateContainer(index, id ?? "")}
                  className="absolute inset-0 z-20 h-full"
                  >
                  <div className="group cursor-pointer relative w-full h-full">
                    {ep?.thumbnail && (
                      <Image
                      src={data.posterType === "poster" ? (container?.poster ?? "https://placehold.co/300x200/png") : (ep.thumbnail ?? "https://placehold.co/256x144/png")}
                      alt={ep.title ?? epId}
                      fill
                      sizes="512px"
                      className="object-cover rounded-sm bg-secondary"
                      priority={index === 0}
                      />
                    )}
                  </div>
                </MediaSelect>
              </div>
                {data.showTitle && <p className="mt-1 absolute text-muted-foreground line-clamp-1 w-full">{ep?.title}</p>}
            </div>
          )
        })}

        {/* ➕ Add card */}
        <div
          className={cn(
            "relative shrink-0 rounded-lg",
            "border border-dashed border-border",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:border-foreground/40 transition",
            "overflow-hidden h-auto",
            cardClass
          )}
        >

          <MediaSelect
            value=""
            onChange={addContainer}
          >
          <div className="absolute inset-0 cursor-pointer justify-center flex flex-row gap-2 items-center">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add container</span>
          </div>
          </MediaSelect>
        </div>
    </div>
  )
}
