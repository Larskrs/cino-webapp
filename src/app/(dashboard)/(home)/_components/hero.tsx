"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/app/_components/hls-video"
import MediaRow from "./media-row"
import { motion, AnimatePresence } from "framer-motion"
import { getPoster } from "@/lib/poster"
import { useSelectedMedia } from "./selected-media-hook"
import { cn } from "@/lib/utils"

const TRAILER_DELAY = 3000
const VISIBILITY_THRESHOLD = 0.25

export default function Hero({ medias }: { medias: any[] }) {
  const { previewIndex, setPreviewIndex, colors, setColors } = useSelectedMedia()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const preview = medias[previewIndex]

  const [playTrailer, setPlayTrailer] = useState(false)
  const [inView, setInView] = useState(false)

  const previewRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  /* Trailer delay */
  useEffect(() => {
    setPlayTrailer(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setPlayTrailer(true)
    }, TRAILER_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [previewIndex])

  /* Visibility observer */
  useEffect(() => {
    if (!previewRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.intersectionRatio >= VISIBILITY_THRESHOLD)
      },
      { threshold: VISIBILITY_THRESHOLD }
    )

    observer.observe(previewRef.current)
    return () => observer.disconnect()
  }, [])
  
  useEffect(() => {
  const video = videoRef.current
  if (!video) return

  // --- Playback control ---
  if (playTrailer) {
    video
      .play()
  } else {
    video.pause()
    video.currentTime = 0
  }

  //   video.muted = !inView

}, [playTrailer, inView, previewIndex])

  if (!preview) return null

  return (
    <section className="w-full pb-6">
      <div
        ref={previewRef}
        className="-mt-[var(--nav-height)] relative w-full overflow-hidden lg:h-[60dvh] xl:h-[80dvh] 2xl:h-[75dvh] h-125 bg-black"
      >
        <AnimatePresence mode="wait">
          <motion.div
  key={preview.id}
  initial={{ opacity: 0, scale: 1.15 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="absolute inset-0"
>
  {/* VIDEO – always mounted (preloads) */}
  <VideoPlayer
  key={preview.videoId}
    id={preview.videoId}
    ref={videoRef}
    autoPlay={false}
    muted
    loop
    playsInline
    controls={false}
    preload="auto"
    className={cn(
      "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
      playTrailer && inView ? "opacity-100" : "opacity-100"
    )}
  />

  {/* POSTER IMAGE – fades out */}
  <Image
    src={getPoster(preview.posters, ["banner", "video", "poster"])}
    alt={preview.title}
    fill
    priority
    className={cn(
      "object-cover transition-opacity duration-500",
      playTrailer && inView ? "opacity-0" : "opacity-100"
    )}
  />
</motion.div>

        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/0 to-transparent" />
        <div className="absolute h-[50dvh] inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/0 to-transparent" />

        {/* Meta */}
        <motion.div
          key={`${preview.id}-meta`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
          className="absolute inset-0 flex flex-col justify-end md:justify-center"
        >
          <div className="container mx-auto xl:-translate-y-16 p-6 md:p-8 space-y-3">
            <Badge variant="secondary" className="bg-primary text-small text-background gap-2 px-3 w-fit">
              {preview.badge}
            </Badge>

            <h1 className="text-2xl md:text-4xl max-w-lg font-bold text-primary">
              {preview.title}
            </h1>

            <p className="text-lg max-w-md text-primary/75">
              {preview.description}
            </p>
          </div>
        </motion.div>
      </div>

      <MediaRow
        className="xl:-mt-25 px-2 max-w-[1700px] mx-auto"
        items={medias}
        size="lg"
        posterType="video"
        selectedIndex={previewIndex}
        onItemClick={(_, index) => {
          setPreviewIndex(index)
          setColors({
            background: medias?.[index]?.color.background ?? "",
            primary: medias?.[index]?.color.primary ?? "",
          })
        }}
        onItemHover={(_, index) => {
          setPreviewIndex(index)
          setColors({
            background: medias?.[index]?.color.background ?? "",
            primary: medias?.[index]?.color.primary ?? "",
          })
        }}
      />
    </section>
  )
}
