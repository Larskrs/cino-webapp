import { type BlockSchema } from "../../types"

export type HeroData = {
  containers: string[]
}

export const HeroSchema: BlockSchema<HeroData> = {
  type: "hero",

  defaults: {
    containers: []
  },

  properties: {
    containers: { type: "hidden", }
  },
}