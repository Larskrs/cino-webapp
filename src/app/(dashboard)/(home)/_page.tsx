"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import VideoPlayer from "@/app/_components/hls-video"
import Image from "next/image"

type Video = {
  id: string
  title: string
  views: string
  date: string
  description: string
}

const videoFeed: Video[] = [
  {
    id: "20250927-b47fc640b07187e5",
    title: "Minecraft weed update trailer",
    views: "5 views",
    date: "Feb 7, 2025",
    description: "Description stays visible because video height is clamped.",
  },
  {
    id: "20250207-473868e90d9a768d",
    title: "Desperados, Banditos & Litagos - Trailer #1",
    views: "1.2M views",
    date: "Feb 7, 2025",
    description: "Description stays visible because video height is clamped.",
  },
  {
    id: "20250921-b7833b1f32260afa",
    title: "ITGarasjen.no test",
    views: "842K views",
    date: "Feb 4, 2025",
    description: "Another description.",
  },
  {
    id: "20251012-216dbd5619f89e57",
    title: "Community S3.E4 - Remedial Chaos Theory",
    views: "500K views",
    date: "Feb 1, 2025",
    description: "Yet another description.",
  },
]

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()

  /* ---------------- Current video ---------------- */
  const urlVideoId = searchParams.get("w")

  const [currentId, setCurrentId] = useState(
    urlVideoId ?? videoFeed[0].id
  )

  /* ---------------- Sync URL → state ---------------- */
  useEffect(() => {
    if (urlVideoId && urlVideoId !== currentId) {
      setCurrentId(urlVideoId)
    }
  }, [urlVideoId])

  /* ---------------- Current video data ---------------- */
  const currentVideo = useMemo(
    () => videoFeed.find(v => v.id === currentId) ?? videoFeed[0],
    [currentId]
  )

  /* ---------------- Click handler ---------------- */
  const playVideo = (id: string) => {
    setCurrentId(id)
    router.push(`?w=${id}`, { scroll: false })
  }

  return (
    <main className="bg-background h-[calc(100vh-var(--nav-height))] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 h-full p-4 pt-0">

        {/* LEFT */}
        <section className="flex flex-col gap-4 overflow-y-auto">
          <VideoPlayer
            key={currentVideo.id}
            id={currentVideo.id}
            autoPlay
            muted
            playsInline
            controls
            className="object-contain rounded-xl w-full h-full aspect-video"
          />

          <h1 className="text-xl font-semibold">
            {currentVideo.title}
          </h1>

          <div className="rounded-2xl bg-neutral-900 p-4 text-sm">
            <p className="font-medium mb-1">
              {currentVideo.views} • {currentVideo.date}
            </p>
            <p>{currentVideo.description}</p>
          </div>
        </section>

        {/* RIGHT – FEED */}
        <aside className="flex flex-col gap-0 overflow-y-auto pr-1">
          {videoFeed.map(video => {
            const active = video.id === currentId

            return (
              <button
                key={video.id}
                onClick={() => playVideo(video.id)}
                className={`
                  flex w-full gap-3 p-2 rounded-xl text-left transition
                  ${active ? "bg-neutral-900" : "hover:bg-neutral-900"}
                `}
              >
                <Image unoptimized alt={`Thumbnail for ${video.title}`} src={`https://bamblingen.no/api/v1/files/video/thumbnail?v=${video.id}`} width={160} height={90} className="w-40 aspect-video rounded-lg bg-neutral-800 shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {video.views}
                  </p>
                </div>
              </button>
            )
          })}
        </aside>
      </div>
    </main>
  )
}
