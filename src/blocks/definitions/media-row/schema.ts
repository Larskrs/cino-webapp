import { type BlockSchema } from "../../types"

export type MediaRowData = {
  episodes: string[],
  posterType?: "poster" | "video",
  showTitle?: boolean,
  title?: string
}

export const MediaRowSchema: BlockSchema<MediaRowData> = {
  type: "media_row",

  defaults: {
    episodes: [],
    posterType: "video",
  },

  properties: {
    title: { type: "text", label: "Rad Tittel"},
    episodes: { type: "hidden" },
    posterType: { type: "select", label: "Poster Type", options: ["poster", "video"]},
    showTitle: { type: "boolean", label: "Show Title"}
  },
}