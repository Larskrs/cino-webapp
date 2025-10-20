"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CardProps } from "./_cards";

type BoardSelectionContextType = {
  selected: CardProps | null;
  selectCard: (card: CardProps) => void;
  unselectCard: () => void;
  switchCard: (card: CardProps) => void;
};

const BoardSelectionContext = createContext<BoardSelectionContextType | null>(null);

export function BoardSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CardProps | null>(null);

  const selectCard = useCallback((card: CardProps) => {
    setSelected(card);
  }, []);

  const unselectCard = useCallback(() => {
    setSelected(null);
  }, []);

  const switchCard = useCallback((card: CardProps) => {
    // commit old selection if needed, then set new one
    setSelected((prev) => (prev?.id === card.id ? prev : card));
  }, []);

  return (
    <BoardSelectionContext.Provider
      value={{
        selected,
        selectCard,
        unselectCard,
        switchCard,
      }}
    >
      {children}
    </BoardSelectionContext.Provider>
  );
}

export function useBoardSelection() {
  const ctx = useContext(BoardSelectionContext);
  if (!ctx)
    throw new Error("useBoardSelection must be used inside a <BoardSelectionProvider>");
  return ctx;
}
