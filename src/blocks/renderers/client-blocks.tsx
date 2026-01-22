"use client"

import { type BlockInstance } from "../types"
import { HeroClient } from "../definitions/hero/client"
import { MediaRowClient } from "../definitions/media-row/client"
import { FeaturedClient } from "../definitions/featured/client"

export function ClientBlocks({ blocks }:{ blocks: BlockInstance[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Block = clientRegistry[block.type]
        if (!Block) return null

        return (
          <Block
            key={block.id}
            data={block.data}
          />
        )
      })}
    </>
  )
}

type ClientBlocksProps<T = any> = {
  data: T
}
const clientRegistry: Record<
  BlockInstance["type"],
  React.ComponentType<ClientBlocksProps<any>>
> = {
  hero: HeroClient,
  media_row: MediaRowClient,
  featured: FeaturedClient
}