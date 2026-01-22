"use client"

import { Trash, Plus } from "lucide-react"
import { type FeaturedData } from "./schema"
import ContainerSelect from "@/components/ui/container-select"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function FeaturedEditor({
  data,
  onChange,
}: {
  data: FeaturedData
  onChange: (patch: Partial<FeaturedData>) => void
}) {
  const selected = data.container ?? null

  const { data: containers } = api.media.list_containers.useQuery(
    selected
      ? { select: [selected] }
      : { select: [] }
  )

  const container = containers?.items?.[0]

  function setContainer(id: string) {
    onChange({ container: id })
  }

  function removeContainer() {
    onChange({ container: undefined })
  }

  return (
    <div className={cn("p-2 gap-4 flex flex-row items-center justify-center")}>
      
      {selected && container ? (
        <div className="relative max-h-60">
          <div
            className={cn(
              "relative max-h-50 h-50 aspect-video overflow-hidden rounded-md bg-secondary"
            )}
          >
            <Button
              onClick={removeContainer}
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 z-10"
            >
              <Trash className="h-4 w-4" />
            </Button>

            <ContainerSelect
              value={selected}
              onChange={setContainer}
              className="absolute inset-0 z-20"
            >
              <div className="relative h-full w-full cursor-pointer">
                <Image
                  src={container.thumbnail ??
                        "https://placehold.co/640x360/png"
                  }
                  alt={container.title}
                  fill
                  sizes="512px"
                  className="object-cover"
                />
              </div>
            </ContainerSelect>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "h-50",
            "relative rounded-md border border-dashed border-border",
            "flex items-center justify-center text-muted-foreground",
            "hover:border-foreground/40 transition aspect-video",
          )}
        >
          <ContainerSelect value="" onChange={setContainer}>
            <div className="absolute inset-0 flex cursor-pointer items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Select container</span>
            </div>
          </ContainerSelect>
        </div>
      )}

      {container?.title && container?.description && <div className="flex flex-col items-start gap-0">
        <h1 className="text-xl font-semibold">{container.title}</h1>
        <p className="text-sm text-muted-foreground">{container?.description}</p>
      </div>}
    </div>
  )
}
