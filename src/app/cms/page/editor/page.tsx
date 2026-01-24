"use client"

import { useEffect, useState } from "react"

import { BlockAddCombobox } from "@/blocks/block-add-combobox"
import { ClientBlocks } from "@/blocks/renderers/client-blocks"
import { EditorBlocks } from "@/blocks/renderers/editor-blocks"
import type { BlockInstance } from "@/blocks/types"

import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { SelectedMediaProvider } from "@/app/(dashboard)/(home)/_components/selected-media-hook"

export default function Page() {
  /* ---------------------------------------------------------------------- */
  /* Data loading                                                            */
  /* ---------------------------------------------------------------------- */

  const homepageQuery = api.media.get_page.useQuery(
    { categoryId: null },
    { retry: false }
  )

  const upsertPage = api.media.upsert_page.useMutation()

  /* ---------------------------------------------------------------------- */
  /* State                                                                   */
  /* ---------------------------------------------------------------------- */

  const [blocks, setBlocks] = useState<BlockInstance[]>([])
  const [view, setView] = useState(false)

  /* ---------------------------------------------------------------------- */
  /* Initialize from API                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (homepageQuery.data?.data) {
      setBlocks(homepageQuery.data.data as BlockInstance[])
    } else if (homepageQuery.isFetched && !homepageQuery.data) {
      // First-time homepage
      setBlocks([
        {
          id: crypto.randomUUID(),
          type: "hero",
          data: {
            containers: [],
          },
        },
      ])
    }
  }, [homepageQuery.data, homepageQuery.isFetched])

  /* ---------------------------------------------------------------------- */
  /* Save handler                                                            */
  /* ---------------------------------------------------------------------- */

  function saveHomepage() {
    upsertPage.mutate({
      id: homepageQuery.data?.id, // undefined = create
      categoryId: null,           // homepage
      data: blocks,
    })
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="relative flex flex-col h-screen w-full">
      {/* Floating actions */}
      <div className="fixed z-50 bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setView((v) => !v)}
        >
          {view ? "Edit page" : "View page"}
        </Button>

        <Button
          disabled={upsertPage.isPending}
          onClick={saveHomepage}
        >
          {upsertPage.isPending ? "Saving…" : "Save homepage"}
        </Button>
      </div>

      {/* Content */}
      {!view ? (
        <div className="mx-auto pb-128 container max-w-5xl flex flex-col gap-4 p-2">
          <EditorBlocks
            blocks={blocks}
            onUpdateOrder={setBlocks}
            onUpdate={(id, updatedBlock) => {
              setBlocks((prev) =>
                prev.map((block) =>
                  block.id === id
                    ? { ...block, ...updatedBlock }
                    : block
                )
              )
            }}
          />

          <BlockAddCombobox
            onAdd={(block) =>
              setBlocks((prev) => [...prev, block])
            }
          />
        </div>
      ) : (
          <SelectedMediaProvider>
            <div className="mt-16 pb-75 bg-background flex flex-col gap-16">
              <ClientBlocks blocks={blocks} />
            </div>
          </SelectedMediaProvider>
      )}

      {/* Debug (optional) */}
      {/* <pre className="fixed bottom-0 left-0 max-h-64 w-full overflow-auto bg-background/90 text-xs p-2 border-t">
        {JSON.stringify(blocks, null, 2)}
      </pre> */}
    </div>
  )
}
