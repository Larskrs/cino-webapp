"use client"
import { Loader2 } from "lucide-react";
import Hero from "./_components/hero";
import MediaRow from "./_components/media-row";
import { useSelectedMedia } from "./_components/selected-media-hook";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation"
import ThemeInjection from "@/app/_components/theme-injection";

export default function StreamingPage() {

  const { data: containers, isLoading, error, isError } = api.media.list_containers.useQuery({})

  const router = useRouter()

  const { selectedId, setSelectedId } = useSelectedMedia()

  useEffect (() => {
    if (selectedId !== "")
    router.push("/serie/"+selectedId)
  }, [selectedId])

  return (
      <div className="bg-background duration-600 ease-out">
        {!isLoading && <Hero medias={containers?.items?.map((media, index) => {

          const latest = media?.seasons?.[0]?.episodes?.[0]

          return {
            id: media.id,
            title: latest?.title,
            description: latest?.description,
            badge: media.title,
            posters: {
              video: latest?.thumbnail,
            },
            videoId: latest?.videoSrc,
            color: media.color
          }
        }) ?? []} />}
        <div className="flex flex-col mx-auto gap-8 max-w-7xl pb-16 py-6 px-2">
          <EpisodeRow seasonId="cmjru7i230005w25a7pe4vf82" containerId="cmjvvueex00004bztnrsgpzwr" />
        </div>
      </div>
  );
}

function EpisodeRow({ seasonId, containerId }: { seasonId: string, containerId: string }) {
  const { data: episodes, isLoading } = api.media.list_episodes.useQuery({ seasonId });
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!episodes?.length) return <></>;

  return (
    <MediaRow
      title="Episoder"
      posterType="video"
      showTitle={true}
      items={episodes.map((ep) => ({
        id: ep.id,
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
      onItemClick={(item, index) => {
        router.push("/serie/"+containerId+"?e="+item?.id)
      }}
    />
  );
}