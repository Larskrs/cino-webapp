import { type BlockSchema } from "../../types"

export type FeaturedData = {
  container: string
}

export const FeaturedSchema: BlockSchema<FeaturedData> = {
  type: "featured",

  defaults: {
    container: ""
  },

  properties: {
    container: { type: "hidden" },
  },
}