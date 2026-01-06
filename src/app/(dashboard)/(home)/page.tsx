"use server"
import Hero from "./_components/hero";
import MediaRow from "./_components/media-row";
import { api } from "@/trpc/server";

export default async function StreamingPage() {

  const containers = await api.media.list_containers({
    isPublic: true
  })

  return (
      <div className="min-h-[100dvh] bg-background duration-600 ease-out">
        {<Hero
        medias={containers?.items?.map((media, index) => {

          const latest = media?.seasons?.[0]?.episodes?.[0]

          return {
            id: media.id,
            title: latest?.title,
            description: latest?.description,
            badge: media.title,
            posters: {
              banner: media.banner,
              video: media.thumbnail ?? latest?.thumbnail,
            },
            videoId: latest?.videoSrc,
            color: media.color
          }
        }) ?? []} />}
        <div className="flex flex-col mx-auto gap-8 max-w-7xl pb-16 py-6 px-2">
          <EpisodeRow
            seasonId="cmjvvva2m00024bzteuisgxfl" containerId="cmjvvueex00004bztnrsgpzwr"
            title="Julebord 25"
          />
          <EpisodeRow
            seasonId="cmjru7i230005w25a7pe4vf82" containerId="cmjroc0pc0003w25aqxocaq6r"
            title="Nyheter"
          />
          <EpisodeRow
            seasonId="cmjznahrx0005ty8gcosmjrdb" containerId="cmjzm3oc40003ty8gnngmic6j"
            title="Nyheter"
          />
        </div>
      </div>
  );
}

async function EpisodeRow({
  seasonId,
  containerId,
  title,
}: {
  seasonId: string;
  containerId: string;
  title?: string;
}) {
  try {
    const [episodes, container] = await Promise.all([
      api.media.list_episodes({ seasonId }),
      api.media.get_container({ id: containerId }),
    ]);

    if (!episodes || episodes.length === 0) return null;
    if (!container) return null;

    return (
      <MediaRow
        title={title ?? container.title}
        posterType="video"
        showTitle
        size="md"
        items={episodes.map((ep) => ({
          id: ep.id,
          link:
            "/serie/" +
            (container.slug ?? containerId) +
            "?e=" +
            ep.id,
          title: ep.title,
          description: ep.description ?? "",
          posters: {
            video: ep.thumbnail ?? "",
          },
          videoId: ep.videoSrc ?? "",
          color: {
            background: "oklch(0.2 0.01 220)",
            primary: "oklch(0.85 0.1 220)",
            accent: "oklch(0.7 0.12 250)",
          },
        }))}
      />
    );
  } catch (error) {
    // Optional: log only in dev
    if (process.env.NODE_ENV === "development") {
      console.error("EpisodeRow failed:", {
        seasonId,
        containerId,
        error,
      });
    }

    // Don't render anything on error
    return <></>;
  }
}
