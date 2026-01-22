"use server"

import { api } from "@/trpc/server"
import { type MediaRowData } from "./schema"
import MediaRow from "@/app/(dashboard)/(home)/_components/media-row"

export async function MediaRowServer({ data }: { data: MediaRowData }) {

  const episodes = await api.media.get_episodes({
    select: data.episodes
  })

  return <div className="container mx-auto max-w-7xl"><MediaRow
  size={data.posterType === "poster" ? "sm" : "md"}
  posterType={data.posterType}
  showTitle={data.showTitle}
  title={data.title}
  items={episodes?.map((media, index) => {

    const container = media.season.container

          return {
            id: media.id,
            title: media.title,
            posters: {
              banner: container.banner ?? "",
              poster: container.poster ?? "",
              video: media.thumbnail ?? "",
            },
          }
        })} /></div>
}
