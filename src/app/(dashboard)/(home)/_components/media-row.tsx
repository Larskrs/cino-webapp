"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { getPoster, type PosterFormats } from "@/lib/poster"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export type MediaRowItem = {
  id: string
  slug?: string
  title: string
  link?: string
  posters: PosterFormats
}

interface MediaRowProps {
  title?: string
  items: MediaRowItem[]
  showTitle?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  posterType?: "poster" | "video"
  selectedIndex?: number
  onItemClick?: (item: MediaRowItem | null, index: number) => void
  onItemHover?: (item: MediaRowItem | null, index: number) => void
}

const GAP = 0
const HOVER_DELAY = 500

const SWIPE_THRESHOLD = 30        // px required to trigger page change
const SWIPE_TIME_LIMIT = 500     // ms (avoid slow drags)

const WHEEL_SWIPE_THRESHOLD = 60
const WHEEL_COOLDOWN = 100


export default function MediaRow({
  title,
  items,
  showTitle,
  size = "md",
  className,
  posterType = "video",
  selectedIndex,
  onItemClick,
  onItemHover,
}: MediaRowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wheelCooldownRef = useRef(false)

  const swipeStartX = useRef<number | null>(null)
  const swipeStartTime = useRef<number | null>(null)

  const [containerWidth, setContainerWidth] = useState(0)
  const [page, setPage] = useState(0)

  const itemRef = useRef<HTMLDivElement | null>(null)
  const [itemWidth, setItemWidth] = useState(0)

  useEffect(() => {
  if (!itemRef.current) return

  const measure = () => {
    setItemWidth(itemRef.current!.offsetWidth)
  }

  measure()
  window.addEventListener("resize", measure)
  return () => window.removeEventListener("resize", measure)
}, [])

  /* Measure container width */
  useEffect(() => {
    if (!containerRef.current) return

    const measure = () => {
      setContainerWidth(containerRef.current!.offsetWidth)
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  /* Fully visible items only */
  const itemsPerPage = useMemo(() => {
    if (containerWidth <= 0) return 1
    return Math.max(
      1,
      Math.floor((containerWidth + GAP) / (itemWidth + GAP))
    )
  }, [containerWidth, itemWidth])

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / itemsPerPage)
  )

  /* Clamp page on resize */
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  const prev = () => setPage((p) => Math.max(0, p - 1))
  const next = () =>
    setPage((p) => Math.min(totalPages - 1, p + 1))

  const pageWidth =
    itemsPerPage * itemWidth + GAP * (itemsPerPage - 1)

  const offset = page * pageWidth

  const canGoLeft = page > 0
  const canGoRight = page < totalPages - 1

  /* ---- Hover intent handlers ---- */

  useEffect(() => {
    if (itemsPerPage > 2) { return }
    onItemHover?.(items[page] ?? null, page)
  }, [page])

  const handleMouseEnter = (item: MediaRowItem, index: number) => {
    if (!onItemHover) return

    // Clear any previous hover intent
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    hoverTimerRef.current = setTimeout(() => {
      onItemHover(item, index)
    }, HOVER_DELAY)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
  swipeStartX.current = e.clientX
  swipeStartTime.current = Date.now()
}

const handleClickItem = (item: MediaRowItem, index: number) => {
  if (item?.link) {
    router.push(item?.link)
    return
  }

  onItemClick?.(item, index)
}

const onPointerUp = (e: React.PointerEvent) => {
  if (swipeStartX.current === null || swipeStartTime.current === null) return

  const deltaX = e.clientX - swipeStartX.current
  const deltaTime = Date.now() - swipeStartTime.current

  swipeStartX.current = null
  swipeStartTime.current = null

  // Ignore slow or tiny swipes
  if (Math.abs(deltaX) < SWIPE_THRESHOLD || deltaTime > SWIPE_TIME_LIMIT) {
    return
  }

  if (deltaX < 0 && canGoRight) {
    next()
  } else if (deltaX > 0 && canGoLeft) {
    prev()
  }
}

  useEffect(() => {
  const el = containerRef.current
  if (!el) return

  const onWheel = (e: WheelEvent) => {
    // Only care about horizontal trackpad gestures
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return

    e.preventDefault()

    if (wheelCooldownRef.current) return
    wheelCooldownRef.current = true

    setTimeout(() => {
      wheelCooldownRef.current = false
    }, WHEEL_COOLDOWN)

    if (e.deltaX > WHEEL_SWIPE_THRESHOLD && canGoRight) {
      next()
    } else if (e.deltaX < -WHEEL_SWIPE_THRESHOLD && canGoLeft) {
      prev()
    }
  }

  el.addEventListener("wheel", onWheel, { passive: false })

  return () => {
    el.removeEventListener("wheel", onWheel)
  }
}, [canGoLeft, canGoRight, next, prev])


  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const sizes = {
    "sm": "w-[45vw] sm:w-[22vw] md:w-55 lg:w-60 xl:w-80",
    "md": "w-[55vw] sm:w-[30vw] md:w-60 lg:w-75 xl:w-100",
    "lg": "w-[70vw] sm:w-[45vw] md:w-100 lg:w-[35vw] xl:w-125" 
  }

  const router = useRouter()

  return (
    <section className={cn("relative w-full", className)}>
      {title && (
        <div className="-mb-1 ml-2 flex items-end justify-between">
          <h3 className="duration-500 text-primary font-semibold text-2xl md:text-2xl xl:text-3xl">
            {title}
          </h3>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full relative pt-2 overflow-x-hidden touch-pan-y"
      >
        {/* Rail */}
<motion.div
  className="flex touch-pan-y select-none cursor-grab active:cursor-grabbing"
  animate={{
    x: -(offset + (page !== 0 ? GAP : 0)),
  }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 25,
  }}
  onPointerDown={onPointerDown}
  onPointerUp={onPointerUp}
>
          {items.map((item, index) => (
            <article
              key={item.id}
              onClick={() => handleClickItem?.(item, index)}
              onMouseEnter={() => handleMouseEnter(item, index)}
              onMouseLeave={handleMouseLeave}
              ref={index === 0 ? itemRef : undefined}
              className={clsx(
                "shrink-0 cursor-pointer transition-transform duration-300 py-2 px-2",
              
                sizes[size],
                "min-w-[180px]"
              )}
            >
              <div
                className={cn(
                    "relative hover:-translate-y-2 duration-150 bg-background hover:shadow-[0px_4px_8px] hover:shadow-black/50 overflow-hidden rounded-lg"
                    )}>
                <div className={cn("relative aspect-video w-full", posterType === "video" ? "aspect-video" : "aspect-[27/40]")}>
                  <Image
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    src={getPoster(item.posters, [posterType, "video", "banner", "poster"])}
                    alt={item.title}    
                    width={512}
                    height={512}
                    quality={100}
                    className={cn(
                      onItemHover ? (index === selectedIndex ? "opacity-100" : "opacity-50") : "",
                      "object-cover w-full h-full duration-250"
                    )}
                  />
                </div>
              </div>
              {showTitle && <p className="text-primary text-lg mt-0.5 line-clamp-1">{item.title}</p>}
            </article>
          ))}
        </motion.div>

        {/* LEFT CONTROL */}
        {canGoLeft && (
          <button
            onClick={prev}
            aria-label="Previous page"
            className="cursor-pointer absolute left-0 top-0 z-10 h-full w-20 flex items-center justify-start"
          >
            <div className={cn(showTitle ? "-translate-y-3" : "","relative ml-5 rounded-full bg-background p-2 text-primary backdrop-blur transition hover:bg-primary hover:text-background")}>
              <ChevronLeft className="size-8 lg:size-10" />
            </div>
          </button>
        )}

        {/* RIGHT CONTROL */}
        {canGoRight && (
          <button
            onClick={next}
            aria-label="Next page"
            className="cursor-pointer absolute right-0 top-0 z-10 h-full w-20 flex items-center justify-end"
          >
            <div className={cn(showTitle ? "-translate-y-3" : "","relative mr-5 rounded-full bg-background p-2 text-primary backdrop-blur transition hover:bg-primary hover:text-background")}>
              <ChevronRight className="size-8 lg:size-10" />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
