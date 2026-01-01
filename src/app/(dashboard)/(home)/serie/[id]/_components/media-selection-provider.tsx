// selection-provider.tsx
"use client"

import { createContext, useContext, useState } from "react"

type SelectionContextValue = {
  seasonId: string
  episodeId: string | null
  setSeasonId: (id: string) => void
  setEpisodeId: (id: string | null) => void
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function MediaSelectionProvider({
  initialSeasonId,
  initialEpisodeId,
  children,
}: {
  initialSeasonId: string
  initialEpisodeId?: string | null
  children: React.ReactNode
}) {
  const [seasonId, setSeasonId] = useState(initialSeasonId)
  const [episodeId, setEpisodeId] = useState(initialEpisodeId ?? null)

  return (
    <SelectionContext.Provider
      value={{ seasonId, episodeId, setSeasonId, setEpisodeId }}
    >
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error("useSelection must be used inside SelectionProvider")
  return ctx
}
