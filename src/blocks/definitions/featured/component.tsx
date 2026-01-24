"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelectedMedia } from "@/app/(dashboard)/(home)/_components/selected-media-hook"
import type { ThemeColor } from "@/app/_components/theme-injection"

type FeaturedItem = {
  title: string
  description?: string
  thumbnail: string
  slug: string
  colors: ThemeColor
  publishedAt?: string
}

export default function FeaturedComponent({
  title,
  description,
  thumbnail,
  colors,
  slug,
  publishedAt,
}: FeaturedItem) {
  const ref = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const wasVisibleRef = useRef(false)

  const { setColors } = useSelectedMedia()

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return

      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      lastScrollY.current = currentScrollY

      const rect = ref.current.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const vh = window.innerHeight

      const min = vh * 0.25
      const max = vh * 0.75

      const isVisibleNow = centerY >= min && centerY <= max

      // 🔑 Edge trigger: NOT visible → visible (while scrolling down)
      if (scrollingDown && !wasVisibleRef.current && isVisibleNow) {
        setColors(colors)
        // optional debug
        // console.log("Activated:", title)
      }

      // Update visibility state AFTER checks
      wasVisibleRef.current = isVisibleNow
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    // initial sync
    onScroll()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [colors, setColors, title])

  return (
    <div ref={ref} className="container max-w-7xl mx-auto mt-4 p-2">
      <Link href={`/serie/${slug}`} className="text-accent">
        <h2 className="hidden md:flex text-2xl lg:text-3xl font-semibold mb-1">
          {title}
        </h2>

        <div className="w-full rounded-xl bg-background transition-colors duration-700 overflow-hidden">
          <div className="grid grid-cols-5">
            {/* Thumbnail */}
            <div className="col-span-full md:col-span-3 aspect-video relative">
              {publishedAt && (
                <p className="absolute left-4 top-4 z-10 bg-accent text-background transition-colors duration-700 px-3 py-0.5 rounded-sm">
                  {publishedAt}
                </p>
              )}

              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>

            {/* Text panel */}
            <div className="col-span-full md:col-span-2 bg-secondary transition-colors duration-700 flex flex-col justify-center p-6">
              <h2 className="md:hidden text-lg sm:text-xl font-semibold">
                {title}
              </h2>

              <p className="text-base lg:text-lg text-muted-foreground mt-2">
                {description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
