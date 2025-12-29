"use client"
import { Badge } from "lucide-react";
import Hero from "./_components/hero";
import Image from "next/image";
import MediaRow from "./_components/media-row";
import { SelectedMediaProvider, useSelectedMedia } from "./_components/selected-media-hook";
import { useEffect } from "react";

export const medias = [
  {
    id: "1",
    title: "Desperados, Banditos & Litagos",
    description: "En spennende kortfilm om som utforsker hevnaktig nød.",
    badge: "Short-Film",
    posters: {
      poster: "https://bamblingen.no/api/v1/files?fileId=20250310-67efde647b55fb19",
      banner: "https://bamblingen.no/api/v1/files?fileId=20250812-43bb03e09b23aac1",
      video: "https://bamblingen.no/api/v1/files?fileId=20250225-7b0f1d2d0a433187",
    },
    videoId: "20250207-01312bee5f27df78",
    color: {
      background: "oklch(0.1 0.09 32)",
      primary: "oklch(0.8 0.25 32)",
      accent: "oklch(0.65 0.18 28)",
    },
  },

  {
    id: "community",
    title: "Community",
    description: "En humoristisk serie som utforsker livet i en lite typisk høyskole.",
    badge: "Scripted TV",
    posters: {
      poster:
        "https://i.redd.it/season-1-6-posters-v0-8myfy1nhjv9a1.jpg?width=500&format=pjpg&auto=webp&s=e44e437136b038eadc00042645f78d3da7db03b0",
      video:
        "https://resizing.flixster.com/Zq14qbrbzJIweOoCqHFVYKqf2yc=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p8206437_b_h8_ab.jpg",
      banner:
        "https://bamblingen.no/api/v1/files/video/thumbnail?v=20251012-216dbd5619f89e57",
    },
    videoId: "20251012-216dbd5619f89e57",
    color: {
      background: "oklch(0.32 0.02 255)", // muted campus gray-blue
      primary: "oklch(0.9 0.025 250)",    // sitcom-friendly highlight
      accent: "oklch(0.75 0.10 260)",
    },
  },

  {
    id: "9",
    title: "Ulefoss",
    description: "En spennende kortfilm om som utforsker hevnaktig nød.",
    badge: "Short-Film",
    posters: {
      poster: "https://bamblingen.no/api/v1/files?fileId=20250129-51c3dae1f17ba27cf04064aebcde98beedd95921b981b968",
      video: "https://bamblingen.no/api/v1/files/video/thumbnail?v=20250209-0b4db71651aa5e21",
    },
    videoId: "20250209-0b4db71651aa5e21",
    color: {
      background: "oklch(0.3 0.05 227.35)", // cold industrial green
      primary: "oklch(0.9 0.025 227.35)",
      accent: "oklch(0.62 0.14 165)",
    },
  },

  {
    id: "3",
    title: "Barnehagen",
    description: 'Shakkalakka barnehage var et fredelig sted, før Daniel "kom".',
    badge: "Drama (18+)",
    posters: {
      poster: "https://bamblingen.no/api/v1/files?fileId=20250129-96a5b018eaae44f2d15c378851aa1738f2de03a01a9a8b50",
      video: "https://bamblingen.no/api/v1/files/video/thumbnail?v=20250428-350eafd38630e83f",
    },
    videoId: "20250324-a066fbe1d5421912",
    color: {
      background: "oklch(0.3 0.05 227.35)", // cold industrial green
      primary: "oklch(0.9 0.025 227.35)",
      accent: "oklch(0.62 0.14 165)",
    },
  },

  {
    id: "7",
    title: "Daniel Pounder en Vaskebjørn",
    description: "En spennende ny film som utforsker ukjente temaer.",
    badge: "Feature Film",
    posters: {
      banner: "https://bamblingen.no/api/v1/files/video/thumbnail?v=20250219-b5ae91cd41ba29cc",
    },
    videoId: "20250219-b5ae91cd41ba29cc",
    color: {
      background: "oklch(0.30 0.07 150)",  // playful forest gold
      primary: "oklch(0.82 0.14 95)",
      accent: "oklch(0.70 0.18 105)",
    },
  },
]


const randomOrder = () => {
    const m = medias.slice()
    return m.sort(() => Math.random() - 0.5)
}

export default function StreamingPage() {

  return (
      <div className="bg-background duration-600 ease-out">
        <Hero medias={medias} />
        <div className="flex flex-col mx-auto gap-8 max-w-7xl pb-16 py-6 px-2">
          <MediaRow className="" posterType="poster" size="md" items={randomOrder()} title="Dokumentarer" />
          <MediaRow posterType="video" size="md" items={randomOrder()} title="Nytt innhold" />
        </div>
      </div>
  );
}
