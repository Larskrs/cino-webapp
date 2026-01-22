"use server"

import { type BlockInstance } from "../types"
import { HeroServer } from "../definitions/hero/server"
import { MediaRowServer } from "../definitions/media-row/server"
import { FeaturedServer } from "../definitions/featured/server"

export async function ServerBlocks({ blocks }:{ blocks: BlockInstance[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Block = serverRegistry[block.type]
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

type ServerBlocksProps<T = any> = {
  data: T
}
const serverRegistry: Record<
  BlockInstance["type"],
  React.ComponentType<ServerBlocksProps<any>>
> = {
  hero: HeroServer,
  media_row: MediaRowServer,
  featured: FeaturedServer
}