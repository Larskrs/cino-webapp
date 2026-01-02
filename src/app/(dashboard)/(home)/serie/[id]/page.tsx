// page.tsx
import { api } from "@/trpc/server"
import { notFound } from "next/navigation"
import ThemeInjection, { type ThemeColor } from "../../../../_components/theme-injection"
import { MediaSelectionProvider } from "./_components/media-selection-provider"
import SeasonSelector from "./_components/season-selector"
import EpisodeList from "./_components/episode-list"
import EpisodePlayer from "./_components/episode-player"
import { type MediaEpisode } from "@prisma/client"

function isLikelyId(value: string) {
  return /^[a-z0-9]{16,}$/.test(value); // Adjust length if needed
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ e?: string }>
}) {

  const containerParam = (await params).id;

  const containerQuery = isLikelyId(containerParam)
    ? { id: containerParam }
    : { slug: containerParam };

  const media = await api.media.get_container(containerQuery)
  if (!media) return notFound()

  const requestedEpisodeId = (await searchParams).e

  let initialSeasonId = media.seasons[0]?.id
  let initialEpisode = null
  let initialEpisodes: MediaEpisode[] = []

  const color = (media?.color as ThemeColor ?? {
    background: "",
    primary: "",
    secondary: "",
    text: ""
  })

  // 🔍 If episode is specified, try to resolve it
  if (requestedEpisodeId) {
    for (const season of media.seasons) {
      const seasonData = await api.media.get_season({ id: season.id })

      const match = seasonData.episodes.find(
        (ep) => ep.id === requestedEpisodeId
      )

      if (match) {
        initialSeasonId = season.id
        initialEpisode = match
        initialEpisodes = seasonData.episodes
        break
      }
    }
  }

  // 🧯 Fallback: default season + latest episode
  if (!initialEpisode) {
    const seasonData = await api.media.get_season({
      id: initialSeasonId!,
    })

    initialEpisodes = seasonData.episodes
    initialEpisode = seasonData.episodes.at(0) ?? null
  }

  if (!initialSeasonId || !initialEpisode) {
    return notFound()
  }

  return (
    <>
      <ThemeInjection color={color} />

      <MediaSelectionProvider
        initialSeasonId={initialSeasonId}
        initialEpisodeId={initialEpisode.id}
      >
        <div className="min-h-[calc(100dvh-var(--nav-height))]">
          <EpisodePlayer initialEpisode={initialEpisode as any} />

          <div className="py-16 min-h-150 flex flex-col gap-8 px-4 container max-w-6xl mx-auto md:grid grid-cols-4">
            {media.seasons && <SeasonSelector seasons={media?.seasons} />}
            <EpisodeList initialEpisodes={initialEpisodes} />
          </div>
        </div>
      </MediaSelectionProvider>
    </>
  )
}
