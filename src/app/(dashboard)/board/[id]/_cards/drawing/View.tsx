"use client";

import { useEffect, useState } from "react";
import type { CardProps } from "../index";

const BASE_WIDTH = 400;
const BASE_HEIGHT = 300;

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
    <div className="relative w-full aspect-[4/3] bg-white border border-neutral-300 overflow-hidden">
      <svg
        viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
        className="w-full h-full"
      >
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
