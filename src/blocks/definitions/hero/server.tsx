// blocks/implementations/hero/hero.server.tsx
"use server"

import Hero from "@/app/(dashboard)/(home)/_components/hero"
import { type HeroData } from "./schema"
import { api } from "@/trpc/server"

export async function HeroServer({ data }: { data: HeroData }) {

  const containers = await api.media.list_containers({
    select: data.containers
  })

  return <div>
        {<Hero
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
        }) ?? []} />}
  </div>
}
