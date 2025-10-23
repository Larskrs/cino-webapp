"use client";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function TextCardView({ card }: { card: any }) {

  const { colors } = useTheme()

  return (
    <div className={cn("text-sm pointer-events-none text-neutral-600 min-w-60 w-full whitespace-pre-wrap break-words select-none", colors.components.boards.card)}>
      <Image width={400} height={400} src={card.content} alt="Image" className="rounded-0 w-full h-full object-cover" />
    </div>
  );
}
