"use client"

import { Plus, Trash } from "lucide-react"
import { type HeroData } from "./schema"
import ContainerSelect from "@/components/ui/container-select"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import Image from "next/image"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"

export function HeroEditor({
  data,
  onChange,
}: {
  data: HeroData
  onChange: (patch: Partial<HeroData>) => void
}) {
  const selected = data.containers ?? []

  const { data: containers } = api.media.list_containers.useQuery({
    select: selected,
  })

  const containerMap = useMemo(() => {
    return new Map(containers?.items.map(c => [c.id, c]))
  }, [containers])

  function updateContainer(index: number, value: string) {
    if (selected.includes(value)) { return }
    const next = [...selected]
    next[index] = value
    onChange({ containers: next })
  }

  function addContainer(id: string) {
    if (selected.includes(id)) { return }
    onChange({ containers: [...selected, id] })
  }

  function remContainer(id: string) {
    onChange({ containers: selected.filter(c => c !== id) })
  }

  return (
    <div className="p-2 flex gap-3 overflow-x-auto">
        

        {selected.map((containerId, index) => {
          const container = containerMap.get(containerId)

          return (
            <div
              key={containerId}
              className="relative shrink-0 w-64 aspect-video rounded-md overflow-hidden"
            >
              <Button
                onClick={() => remContainer(containerId)}
                variant={"opposite"}
                className="absolute top-2 right-2 z-1 text-xs size-8 bg-background text-primary rounded"
              >
                <Trash className="size-4" />
              </Button>

              <ContainerSelect
                value={containerId}
                onChange={(id) => updateContainer(index, id)}
                className="absolute inset-0 z-20 h-full"
              >
                <div className="relative w-full h-full p-2">
                  {container?.thumbnail && (
                    <Image
                      src={container.thumbnail}
                      alt={container.title ?? containerId}
                      fill
                      sizes="256px"
                      className="object-cover rounded-sm"
                      priority={index === 0}
                    />
                  )}
                </div>
              </ContainerSelect>
            </div>
          )
        })}

        {/* ➕ Add card */}
        <div
          className={cn(
            "relative shrink-0 w-64 aspect-video rounded-lg",
            "border border-dashed border-border",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:border-foreground/40 transition",
            "overflow-hidden"
          )}
        >

          <ContainerSelect
            value=""
            onChange={addContainer}
          >
          <div className="absolute inset-0 cursor-pointer justify-center flex flex-row gap-2 items-center">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add container</span>
          </div>
          </ContainerSelect>
        </div>
    </div>
  )
}
