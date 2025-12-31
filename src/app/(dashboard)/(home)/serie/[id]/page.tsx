// page.tsx (server)
import { api } from "@/trpc/server"
import { notFound } from "next/navigation"
import ThemeInjection from "../../../../_components/theme-injection"
import { MediaSelectionProvider } from "./_components/media-selection-provider"
import SeasonSelector from "./_components/season-selector"
import EpisodeList from "./_components/episode-list"
import EpisodePlayer from "./_components/episode-player"

export default async function Page({ params }: { params: { id: string } }) {
  const media = await api.media.get_container({ id: params.id })
  if (!media) return notFound()

  const defaultSeason = media.seasons[0]
  const episodes = await api.media.get_season({
    id: defaultSeason?.id ?? "",
  })

  const latestEpisode = episodes.episodes.at(0)

  return (
    <MediaSelectionProvider
      initialSeasonId={defaultSeason.id}
      initialEpisodeId={latestEpisode?.id}
    >
      <div className="min-h-[calc(100dvh-var(--nav-height))]">
        <ThemeInjection color={media.color as any} />

        <EpisodePlayer initialEpisode={latestEpisode as any} />
        <div className="py-16 min-h-150 gap-8 container mx-auto grid grid-cols-4">
          <SeasonSelector seasons={media.seasons} />
          <EpisodeList initialEpisodes={episodes.episodes} />
        </div>
      </div>
    </MediaSelectionProvider>
  )
}
