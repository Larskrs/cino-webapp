"use client";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export default function TextCardView({ card }: { card: any }) {

  const { colors } = useTheme()

  return (
    <p className={cn("text-lg whitespace-pre-wrap break-words p-4", colors.components.boards.card)}>
      {card.content || "Double-click to edit..."}
    </p>
  );
}
