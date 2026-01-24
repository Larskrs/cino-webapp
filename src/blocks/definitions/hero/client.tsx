"use client"

import Hero from "@/app/(dashboard)/(home)/_components/hero"
import { type HeroData } from "./schema"
import { api } from "@/trpc/react"

export function HeroClient({ data }: { data: HeroData }) {

  const {data: containers, isLoading} = api.media.list_containers.useQuery({
    select: data.containers
  })

  if (isLoading || !containers) {
    return (<div>loading...</div>)
  }

  return <Hero
        medias={data.containers?.map((m, index) => {

          const media = containers.items?.find(media => media.id === m)
          if (!media) return null
          
          const latest = media?.seasons?.[0]?.episodes?.[0]

          return {
            id: media.id,
            title: media.type === "SERIES" ? latest?.title : media.title,
            description: media.type === "SERIES" ? latest?.description : media.description,
            badge: media.type === "SERIES" ? media.title : undefined,
            posters: {
              banner: media.banner,
              video: media.thumbnail ?? latest?.thumbnail,
            },
            videoId: latest?.videoSrc,
            color: media.color
          }
        })} />
}
