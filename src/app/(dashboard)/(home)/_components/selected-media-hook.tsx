"use client"

import type { ThemeColor } from "@/app/_components/theme-injection"
import ThemeInjection from "@/app/_components/theme-injection"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type SelectedMediaContextType = {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  selectedId: string,
  setSelectedId: (id: string) => void
  previewIndex: number
  setPreviewIndex: (index: number) => void
  colors: {
    background: string
    primary: string
  }
  setColors: (colors: ThemeColor) => void
}

const SelectedMediaContext = createContext<SelectedMediaContextType | null>(null)

export function SelectedMediaProvider({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedId, setSelectedId] = useState("")
  const [previewIndex, setPreviewIndex] = useState(0)
  const [colors, setColors] = useState<ThemeColor>({
    background: "",
    primary: "",
    secondary: "",
    text: ""
  })

  return (
    <SelectedMediaContext.Provider
      value={{ selectedIndex, setSelectedIndex, selectedId, setSelectedId, colors, setColors, previewIndex, setPreviewIndex }}
    >
      <ThemeInjection color={colors} />
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
