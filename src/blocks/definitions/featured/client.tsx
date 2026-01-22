"use client"

import { type FeaturedData } from "./schema"
import MediaRow from "@/app/(dashboard)/(home)/_components/media-row"
import FeaturedComponent from "./component"
import { api } from "@/trpc/react"

export function FeaturedClient({ data }: { data: FeaturedData }) {

  const {data: container, isLoading} = api.media.get_container.useQuery({
    id: data.container
  })

  if (isLoading || !container) {
    return (<div>loading...</div>)
  }

  const latest = container?.seasons?.[0]?.episodes?.[0]
  const media = container.type === "MOVIE" ? container : latest ?? container

  return <FeaturedComponent
      description={media.description ?? media.description ?? undefined}
      slug={container.slug}
      thumbnail={media.thumbnail ?? container.thumbnail ?? ""}
      title={container.title}
      publishedAt={"Se den nå!"}
    />
}