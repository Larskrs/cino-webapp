"use server"

import { api } from "@/trpc/server"
import { type FeaturedData } from "./schema"
import MediaRow from "@/app/(dashboard)/(home)/_components/media-row"
import FeaturedComponent from "./component"

export async function FeaturedServer({ data }: { data: FeaturedData }) {

  const container = await api.media.get_container({
    id: data.container
  })

  const latest = container?.seasons?.[0]?.episodes?.[0]
  const media = container.type === "MOVIE" ? container : latest ?? container

  return <FeaturedComponent
      description={media.description ?? media.description ?? undefined}
      slug={container.slug}
      thumbnail={media.thumbnail ?? container.thumbnail ?? ""}
      title={media.title}
      publishedAt={"Se den nå!"}
    />
}