"use client";

import type { MediaEpisode, MediaContainer } from "@prisma/client";
import { useSelection } from "./media-selection-provider";
import { api } from "@/trpc/react";
import VideoPlayer from "@/app/_components/hls-video";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function EpisodePlayer({ container, initialEpisode }: { container: MediaContainer, initialEpisode: MediaEpisode }) {
  const { episodeId } = useSelection();
  const { data: episode, isLoading } = api.media.get_episode.useQuery({
    id: episodeId ?? initialEpisode.id,
  });
  const ep = isLoading ? initialEpisode : episode;

  const poster = ep?.thumbnail;
  const videoSrc = ep?.videoSrc;
  const logo = container?.logo ?? null;

  return (
    <div className="relative max-w-[1920px] mx-auto p-4">
      <div className="relative bg-black/50 rounded-md mb-4 w-full max-h-[calc(100dvh-var(--nav-height)-8rem)] aspect-video overflow-hidden">
        {videoSrc ? (
          <VideoPlayer
            key={episodeId ?? initialEpisode.id}
            className="w-full h-full object-cover"
            src={videoSrc}
            poster={poster ?? container.thumbnail ?? ""}
            controls
          />
        ) : poster ? (
          <Image
            src={poster}
            alt={ep?.title ?? "Episode thumbnail"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        {logo && (
          <div className="absolute bottom-4 left-4 z-10">
            <Image
              src={logo}
              alt="Show logo"
              width={300}
              height={150}
              className="object-contain w-full max-w-[25vw] sm:max-w-[250px]"
            />
          </div>
        )}

      </div>
      <div>
{/* --- Show logo overlay --- */}
        {/* --- Title & Description overlay --- */}
        <div className="container mx-auto max-w-6xl rounded-lg relative w-full bg-secondary text-white p-4 text-sm sm:text-base z-10">
          {ep?.description && (
            <p className="line-clamp-3 text-sm sm:text-base text-accent/75">{ep.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
