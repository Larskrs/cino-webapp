"use client"

import { BlockAddCombobox } from "@/blocks/block-add-combobox"
import { ClientBlocks } from "@/blocks/renderers/client-blocks"
import { EditorBlocks } from "@/blocks/renderers/editor-blocks"
import type { BlockInstance } from "@/blocks/types"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Page() {
  const [blocks, setBlocks] = useState<BlockInstance[]>([
    {
      id: "davos",
      type: "hero",
      data: {
        containers: [],
      },
    },
    {
      id: "2",
      type: "media_row",
      data: {
        containers: [],
      },
    },
  ])

  const [view, setView] = useState(false)

  return (
    <div className="flex flex-col h-screen w-full gap-2">
      <Button variant={"opposite"} className="mx-auto" onClick={(e) => setView(!view)} >{view ? "Edit Page" : "View Page"}</Button>
      {!view ? <div className="mx-auto container max-w-5xl flex flex-col p-2">
        <EditorBlocks
          blocks={blocks}
          onUpdateOrder={setBlocks}
          onUpdate={(id, updatedBlock) => {
            setBlocks((prev) =>
              prev.map((block) =>
                block.id === id ? { ...block, ...updatedBlock } : block
          )
        )
      }}
      />
      <BlockAddCombobox
        onAdd={(block) =>
          setBlocks((prev) => [...prev, block])
        }
      />
      </div> : <div className="mt-16 flex flex-col gap-16"><ClientBlocks blocks={blocks} /></div>}

            <pre>
        {JSON.stringify(blocks, null, 4)}
      </pre>
    </div>
  )
}
