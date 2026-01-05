"use client";

import { useState, useRef } from "react";
import type { MediaEpisode, MediaContainer } from "@prisma/client";
import { useSelection } from "./media-selection-provider";
import { api } from "@/trpc/react";
import VideoPlayer from "@/app/_components/hls-video";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function EpisodePlayer({
  container,
  initialEpisode,
}: {
  container: MediaContainer;
  initialEpisode: MediaEpisode;
}) {
  const { episodeId } = useSelection();
  const { data: episode, isLoading } = api.media.get_episode.useQuery({
    id: episodeId ?? initialEpisode.id,
  });

  const ep = isLoading ? initialEpisode : episode;

  const poster = ep?.thumbnail;
  const videoSrc = ep?.videoSrc;
  const logo = container?.logo ?? null;

  /** Playback state */
  const [hideLogo, setHideLogo] = useState(false);
  const hasEverPlayed = useRef(false);

  const markPlayed = () => {
    if (!hasEverPlayed.current) {
      hasEverPlayed.current = true;
      setHideLogo(true);
    }
  };

  return (
    <div className="relative max-w-[1920px] mx-auto p-4">
      <div className="relative rounded-xl mb-4 w-full max-h-[calc(100dvh-var(--nav-height)-8rem)] aspect-video overflow-hidden">

        {videoSrc ? (
          <VideoPlayer
            key={episodeId ?? initialEpisode.id}
            className="w-full h-full object-cover"
            src={videoSrc}
            poster={poster ?? container.thumbnail ?? ""}
            controls

            /** Multiple UX-safe signals */
            onPlay={markPlayed}
            onPlaying={markPlayed}
            onSeeked={(e) => {
              if (e.currentTarget.currentTime > 0.15) markPlayed();
            }}
            onTimeUpdate={(e) => {
              if (e.currentTarget.currentTime > 0.25) markPlayed();
            }}
          />
        ) : poster ? (
          <Image
            src={poster}
            alt={ep?.title ?? "Episode thumbnail"}
            width={1920}
            height={1080}
            quality={100}
            className="object-cover h-full w-full rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}

        {/* 🎬 Animated Logo Overlay */}
        <AnimatePresence>
          {logo && !hideLogo && (
            <motion.div
            initial={{ opacity: 0, y: 64,}}
            animate={{ opacity: 1, y: 0,}}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring" }}
            className="pointer-events-none absolute left-12 bottom-16 flex flex-col items-start justify-end z-10"
            >
              <Image
                src={logo}
                alt="Show logo"
                width={300}
                height={150}
                className="select-none object-contain w-full max-w-[25vw] sm:max-w-[400px]"
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto max-w-6xl rounded-lg relative w-full bg-secondary text-white p-4 text-sm sm:text-base z-10">
        {ep?.description && (
          <p className="line-clamp-3 text-accent/75">
            {ep.description}
          </p>
        )}
      </div>
    </div>
  );
}
