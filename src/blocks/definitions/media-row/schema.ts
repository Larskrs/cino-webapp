import { type BlockSchema } from "../../types"

export type MediaRowData = {
  episodes: string[],
  posterType?: "poster" | "video",
  size: "sm" | "md" | "lg",
  showTitle?: boolean,
  title?: string
}

export const MediaRowSchema: BlockSchema<MediaRowData> = {
  type: "media_row",

  defaults: {
    episodes: [],
    size: "md",
    posterType: "video",
  },

  properties: {
    title: { type: "text", label: "Rad Tittel"},
    size: { type: "select", label: "Size", options: ["sm", "md", "lg"] },
    episodes: { type: "hidden" },
    posterType: { type: "select", label: "Poster Type", options: ["poster", "video"]},
    showTitle: { type: "boolean", label: "Show Title"},
  },
}