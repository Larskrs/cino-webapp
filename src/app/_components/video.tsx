// video.tsx
"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  /** autoplay when 75% in view (default true) */
  autoPlayOnView?: boolean;
  className?: string;
};

export default function Video({
  src,
  className = "",
  autoPlayOnView = true,
  controls, // if provided we render our custom controls
  muted,
  ...props
}: VideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // runtime refs for logic (avoid stale closures)
  const shouldPlayRef = useRef(false);
  const userPausedRef = useRef(false);
  const suppressProgrammaticPlay = useRef(false);
  const suppressProgrammaticPause = useRef(false);
  const actionSeqRef = useRef(0);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // percent
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // IntersectionObserver -> set shouldPlayRef and schedule apply
  useEffect(() => {
    if (!autoPlayOnView) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView75 = entry.intersectionRatio >= 0.75;
          shouldPlayRef.current = inView75;
          scheduleApply();
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlayOnView]);

  // native play/pause listeners to detect user action (but ignore programmatic)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPause = () => {
      if (suppressProgrammaticPause.current) return;
      userPausedRef.current = true;
      setIsPlaying(false);
    };

    const onPlay = () => {
      if (suppressProgrammaticPlay.current) return;
      userPausedRef.current = false;
      setIsPlaying(true);
    };

    const onTime = () => {
      if (!v) return;
      setCurrentTime(v.currentTime);
      setDuration(isFinite(v.duration) ? v.duration : 0);
      if (v.duration) {
        setProgress((v.currentTime / v.duration) * 100);
      }
    };

    v.addEventListener("pause", onPause);
    v.addEventListener("play", onPlay);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onTime);

    return () => {
      v.removeEventListener("pause", onPause);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onTime);
    };
  }, []);

  // schedule apply with sequence counter to avoid races
  function scheduleApply() {
    actionSeqRef.current += 1;
    const seq = actionSeqRef.current;
    void applyDesiredState(seq);
  }

  async function applyDesiredState(seq: number) {
    const v = videoRef.current;
    if (!v) return;

    const desiredPlay = shouldPlayRef.current && !userPausedRef.current;

    const seqAtStart = seq;

    if (desiredPlay) {
      if (!v.paused) {
        setIsPlaying(true);
        return;
      }
      suppressProgrammaticPlay.current = true;
      // ensure muted before calling play
      v.muted = true;
      try {
        const p = v.play();
        if (p instanceof Promise) await p;
        if (actionSeqRef.current !== seqAtStart) return;
        setIsPlaying(true);
        setIsMuted(v.muted);
      } catch (err) {
        // ignore
      } finally {
        suppressProgrammaticPlay.current = false;
      }
    } else {
      if (v.paused) {
        setIsPlaying(false);
        return;
      }
      suppressProgrammaticPause.current = true;
      v.pause();
      setTimeout(() => {
        suppressProgrammaticPause.current = false;
      }, 0);
      setIsPlaying(false);
    }
  }

  // user toggles play/pause
  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    // user action -> mark userPausedRef accordingly
    if (v.paused) {
      userPausedRef.current = false;
      suppressProgrammaticPlay.current = true;
      try {
        await v.play();
        setIsPlaying(true);
      } catch {
        // ignore
      } finally {
        suppressProgrammaticPlay.current = false;
      }
    } else {
      userPausedRef.current = true;
      suppressProgrammaticPause.current = true;
      v.pause();
      setTimeout(() => {
        suppressProgrammaticPause.current = false;
      }, 0);
      setIsPlaying(false);
    }
  };

  // toggle mute
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    // if user unmutes while autoplay would have paused, we preserve user preference
    if (!v.muted) {
      userPausedRef.current = false;
    }
  };

  // seek with percentage input
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = parseFloat(e.target.value);
    const t = (pct / 100) * v.duration;
    v.currentTime = t;
    setProgress(pct);
  };

  // click to seek by seconds (double-tap style)
  const seekBy = (seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    let t = v.currentTime + seconds;
    if (t < 0) t = 0;
    if (v.duration && t > v.duration) t = v.duration;
    v.currentTime = t;
    // If user was paused and taps seek, don't unexpectedly play
    setTimeout(() => {
      if (!v.paused) {
        setIsPlaying(true);
      }
    }, 0);
  };

  // format time
  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  // fullscreen toggle
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    // modern fullscreen API
    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        /* ignore */
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        /* ignore */
      }
    }
  };

  // show/hide controls on interactions
  useEffect(() => {
    if (!controls) return;
    let timeout: any;
    const show = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 2500);
    };

    const c = containerRef.current;
    if (!c) return;

    c.addEventListener("mousemove", show);
    c.addEventListener("touchstart", show);

    // initial hide after short delay if playing
    timeout = setTimeout(() => setShowControls(false), 2500);

    return () => {
      c.removeEventListener("mousemove", show);
      c.removeEventListener("touchstart", show);
      clearTimeout(timeout);
    };
  }, [controls, isPlaying]);

  return (
    <div
      ref={containerRef}
      className={`relative group text-white ${className}`}
      // allow taps to toggle controls
      onClick={() => {
        //setShowControls((s)=>!s);
      }}
    >
      {/* video element: we don't render native controls; we show custom controls if "controls" prop is set */}
      <video
        ref={videoRef}
        src={src}
        className={cn("w-full rounded-xl bg-black", className)}
        muted={muted ?? true}
        playsInline
        preload="metadata"
        onClick={(e)=>{e.stopPropagation(); togglePlay()}}
        // intentionally do not set 'controls' so built-in chrome UI doesn't collide
        {...props}
      />

      {/* Center big play/pause button (Instagram style) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all
            ${isPlaying ? "bg-black/30 p-3" : "bg-white/90 text-black p-4 shadow-lg"}
            ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`
        }
      >
        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
      </button>

      {/* Bottom control bar */}
      {controls && (
        <div
          className={`absolute left-0 right-0 bottom-3 px-3 z-30 transition-all duration-200
            ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}
        >
          <div className="flex items-center gap-3">

            {/* Mute */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.95}}
              className="cursor-pointer flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full p-2"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>

            {/* Progress bar */}
            <div className="flex-1 flex items-center gap-3">



            </div>

            {/* Fullscreen */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.95}}
              className="cursor-pointer flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full p-2"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
