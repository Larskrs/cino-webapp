"use server"

import { api } from "@/trpc/server"
import { type FeaturedData } from "./schema"
import MediaRow from "@/app/(dashboard)/(home)/_components/media-row"
import FeaturedComponent from "./component"
import type { ThemeColor } from "@/app/_components/theme-injection"

export async function FeaturedServer({ data }: { data: FeaturedData }) {

  try {
    const container = await api.media.get_container({
      id: data.container
    })
    
    const latest = container?.seasons?.[0]?.episodes?.[0]
    const media = container.type === "MOVIE" ? container : latest ?? container
    
    return <FeaturedComponent
    description={media.description ?? media.description ?? undefined}
    slug={container.slug}
    thumbnail={media.thumbnail ?? container.thumbnail ?? ""}
    title={container.title}
    publishedAt={"Se den nå!"}
    colors={container.color as ThemeColor}
    />
  } catch (err) {
    return (
      <div></div>
    )
  }
}