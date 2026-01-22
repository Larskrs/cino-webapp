"use client"

import type { ReactNode } from "react"
import { HeroEditor } from "../definitions/hero/editor"
import type { BlockInstance } from "../types"
import { cn } from "@/lib/utils"
import { Cog, GripVertical, Settings, Trash, X } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { MediaRowEditor } from "../definitions/media-row/editor"
import { PropertiesPanel } from "../properties-panel"
import { FeaturedEditor } from "../definitions/featured/editor"

export function EditorCard({
  block,
  children,
  onUpdate,
  onRemove,
}: {
  block: BlockInstance,
  children: ReactNode,
  onUpdate: (updated: any) => void,
  onRemove: () => void
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative mb-4 bg-background",
        isDragging && "opacity-70"
      )}
    >
      <div className="flex flex-row"
          {...attributes}
          {...listeners}
          >
        {/* Drag handle */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 pr-2 text-sm",
            "cursor-grab active:cursor-grabbing",
            "border border-border border-b-0 w-fit select-none rounded-t-sm"
          )}
          >
          <GripVertical className="size-4 text-muted-foreground" />
          <span className="capitalize mr-1">{block.type}</span>
          <PropertiesPanel
            block={block}
            onSave={onUpdate}
          >
          </PropertiesPanel>
        </div>
        <div className="bg-transparent border-t translate-y-full rounded-tr-sm border-tr-border/0 border-b-border w-[calc(100%-20px)]">
          <Button onClick={onRemove} className="absolute text-border right-0 bottom-full" variant={"ghost"} ><X /></Button>
        </div>
      </div>
      {/* Body */}
      <div className="rounded-sm rounded-tl-none border border-border border-t-0">{children}</div>
    </div>
  )
}


export function EditorBlocks({
  blocks,
  onUpdateOrder,
  onUpdate,
}: {
  blocks: BlockInstance[]
  onUpdate: (id: string, patch: Partial<BlockInstance>) => void
  onUpdateOrder: (blocks: BlockInstance[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  function onDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)

    onUpdateOrder(arrayMove(blocks, oldIndex, newIndex))
  }
  function removeBlock (id: string) {
    onUpdateOrder(blocks.filter((b) => b.id !== id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block) => {
          const Editor = editorRegistry[block.type]
          if (!Editor) return null

          return (
            <EditorCard
              key={block.id}
              block={block}
              onUpdate={(patch) =>
                onUpdate(block.id, {
                  data: {
                    ...block.data,
                    ...patch,
                  },
                })}
              onRemove={() => removeBlock(block.id)}
            >
              <Editor
                data={block.data}
                onChange={(patch) =>
                  onUpdate(block.id, {
                    data: {
                      ...block.data,
                      ...patch,
                    },
                  })
                }
              />
            </EditorCard>
          )
        })}
      </SortableContext>
    </DndContext>
  )
}


export type BlockEditorProps<T = any> = {
  data: T
  onChange: (patch: Partial<T>) => void
}

export const editorRegistry: Record<
  BlockInstance["type"],
  React.ComponentType<BlockEditorProps<any>>
> = {
  hero: HeroEditor,
  media_row: MediaRowEditor,
  featured: FeaturedEditor
}