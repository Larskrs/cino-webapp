"use client";

import Image from "next/image";

export default function TextCardView({ card }: { card: any }) {
  return (
    <div className="text-sm pointer-events-none text-neutral-600 min-w-60 w-full whitespace-pre-wrap break-words select-none">
      <Image width={400} height={400} src={card.content} alt="Click to select" className="rounded-0 w-full h-full object-cover" />
    </div>
  );
}
