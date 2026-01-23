"use client"

import Hero from "@/app/(dashboard)/(home)/_components/hero"
import { type MediaRowData } from "./schema"
import { api } from "@/trpc/react"
import MediaRow from "@/app/(dashboard)/(home)/_components/media-row"

export function MediaRowClient({ data }: { data: MediaRowData }) {

  const {data: episodes, isLoading} = api.media.get_episodes.useQuery({
    select: data.episodes
  })

  if (isLoading || !episodes) {
    return (<div>loading...</div>)
  }

  return <div className="container mx-auto max-w-7xl"><MediaRow
  size={data.size}
  posterType={data.posterType}
  showTitle={data.showTitle}
  title={data.title}
  items={data.episodes?.map((e, index) => {

    const media = episodes.find(media => media.id === e)
    if (!media) return null

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
