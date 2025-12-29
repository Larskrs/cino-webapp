"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { medias } from "../page"

export type SelectedMediaContextType = {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  previewIndex: number
  setPreviewIndex: (index: number) => void
  colors: {
    background: string
    primary: string
  }
  setColors: (colors: { background: string; primary: string }) => void
}

const SelectedMediaContext = createContext<SelectedMediaContextType | null>(null)

export function SelectedMediaProvider({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [colors, setColors] = useState<{ background: string; primary: string }>(() => ({
    background: medias?.[0]?.color.background ?? "",
    primary: medias?.[0]?.color.primary ?? "",
  }))

    useEffect(() => {
      document.documentElement.style.setProperty(
        "--background",
        colors.background || ''
      )
      document.documentElement.style.setProperty(
        "--primary",
        colors.primary || ''
      )
    }, [colors])

  return (
    <SelectedMediaContext.Provider
      value={{ selectedIndex, setSelectedIndex, colors, setColors, previewIndex, setPreviewIndex }}
    >
      {children}
    </SelectedMediaContext.Provider>
  )
}

export function useSelectedMedia() {
  const ctx = useContext(SelectedMediaContext)
  if (!ctx) {
    throw new Error("useSelectedMedia must be used inside SelectedMediaProvider")
  }
  return ctx
}
