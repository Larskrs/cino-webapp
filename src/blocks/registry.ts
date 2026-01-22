import { MediaRowSchema } from "./definitions/media-row/schema"
import { HeroSchema } from "./definitions/hero/schema"
import type { BlockSchema } from "./types"
import { FeaturedSchema } from "./definitions/featured/schema"

export const BLOCK_SCHEMAS = {
  // media_row: MediaRowSchema,
  hero: HeroSchema,
  media_row: MediaRowSchema,
  featured: FeaturedSchema
} satisfies Record<string, BlockSchema<any>>
export type BlockType = keyof typeof BLOCK_SCHEMAS