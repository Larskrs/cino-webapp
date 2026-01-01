"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Hls from "hls.js"

const BAMBLINGEN_BASE = "https://bamblingen.no"

function buildBamblingenUrls(id: string, base = BAMBLINGEN_BASE) {
  const v = encodeURIComponent(id)
  return {
    src: `${base}/api/v1/files/video?v=${v}`,
    poster: `${base}/api/v1/files/video/thumbnail?v=${v}`,
  }
}

function resolveRef<T>(
  ref: React.ForwardedRef<T>,
  fallback: React.RefObject<T>
): React.RefObject<T | null> {
  if (!ref) return fallback
  if (typeof ref === "function") {
    return fallback
  }
  return ref
}

type VideoPlayerBaseProps = Omit<
  React.ComponentPropsWithoutRef<"video">,
  "src" | "poster"
> & {
  apiBase?: string
}

type VideoPlayerProps =
  | (VideoPlayerBaseProps & {
      id: string
      src?: never
      poster?: never
    })
  | (VideoPlayerBaseProps & {
      src: string
      id?: never
      poster?: string
    })

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer(props, forwardedRef) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoRef = resolveRef(forwardedRef, internalVideoRef)
  const hlsRef = useRef<Hls | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Runtime guard (in case someone bypasses TS)
  const hasBoth =
    "id" in props && "src" in props && typeof (props as any).src === "string"

  const derived = useMemo(() => {
    if ("id" in props) return buildBamblingenUrls(props.id ?? "", props.apiBase)
    return { src: props.src, poster: props.poster }
  }, [props])

  // Extract video props safely
  const {
    apiBase,
    onLoadStart,
    onLoadedMetadata,
    onCanPlay,
    onPlaying,
    onWaiting,
    onStalled,
    onSeeking,
    onSeeked,
    onError,
    ...videoProps
  } = props as any

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (hasBoth) return

    setIsLoading(true)

    // destroy previous hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Native HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = derived.src
      return
    }

    // hls.js
    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(derived.src)
      hls.attachMedia(video)

      hls.on(Hls.Events.ERROR, () => {
        setIsLoading(false)
      })

      return () => {
        hls.destroy()
        if (hlsRef.current === hls) hlsRef.current = null
      }
    }

    // fallback
    video.src = derived.src
  }, [derived.src, hasBoth])

  if (hasBoth) {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
      >
        <div className="font-semibold">VideoPlayer prop error</div>
        <div>
          Use <code className="px-1">id</code> <b>or</b>{" "}
          <code className="px-1">src</code> — not both.
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video
        {...videoProps}
        ref={videoRef}
        poster={derived.poster}
        className={["block h-full w-full bg-black", videoProps.className]
          .filter(Boolean)
          .join(" ")}
        onLoadStart={(e) => {
          setIsLoading(true)
          onLoadStart?.(e)
        }}
        onLoadedMetadata={(e) => {
          // metadata loaded doesn't always mean playable, but it's progress
          onLoadedMetadata?.(e)
        }}
        onCanPlay={(e) => {
          setIsLoading(false)
          onCanPlay?.(e)
        }}
        onPlaying={(e) => {
          setIsLoading(false)
          onPlaying?.(e)
        }}
        onWaiting={(e) => {
          setIsLoading(true)
          onWaiting?.(e)
        }}
        onStalled={(e) => {
          setIsLoading(true)
          onStalled?.(e)
        }}
        onSeeking={(e) => {
          setIsLoading(true)
          onSeeking?.(e)
        }}
        onSeeked={(e) => {
          // may still buffer after seek; canplay/playing will hide spinner
          onSeeked?.(e)
        }}
        onError={(e) => {
          setIsLoading(false)
          onError?.(e)
        }}
      />

      {/* Center spinner overlay */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="rounded-full bg-background/40 p-3 backdrop-blur">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        </div>
      )}
    </div>
  )
}
)

export default VideoPlayer