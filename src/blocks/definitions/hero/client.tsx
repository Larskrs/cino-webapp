"use client"

import Hero from "@/app/(dashboard)/(home)/_components/hero"
import { type HeroData } from "./schema"
import { api } from "@/trpc/react"

export function HeroClient({ data }: { data: HeroData }) {

  const {data: containers, isLoading} = api.media.list_containers.useQuery({
    isPublic: true,
    select: data.containers
  })

  if (isLoading || !containers) {
    return (<div>loading...</div>)
  }

  return <Hero
        medias={containers?.items?.map((media, index) => {

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
