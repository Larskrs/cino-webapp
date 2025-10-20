"use client";

import { useEffect, useState } from "react";
import type { CardProps } from "../index";

type PathData = {
  id: string;
  d: string;
  color: string;
  width: number;
};

export default function DrawingCardView({ card }: { card: CardProps }) {
  const [paths, setPaths] = useState<PathData[]>([]);

  useEffect(() => {
    try {
      const parsed = card.content ? JSON.parse(card.content) : {};
      setPaths(parsed.paths || []);
    } catch {
      setPaths([]);
    }
  }, [card.content]);

  return (
    <div className="relative w-full h-full bg-white">
      <svg className="w-full h-[300px]">
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            stroke={p.color}
            strokeWidth={p.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
