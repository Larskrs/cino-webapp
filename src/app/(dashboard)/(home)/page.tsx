"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Sparkles,
  Wand2,
  Layers,
  CalendarDays,
  Users,
  ShieldCheck,
  Zap,
  FileVideo2,
  Palette,
  Sun,
  Moon,
  Check,
  ChevronDown,
} from "lucide-react"
import Hero from "./_components/hero";

type NavItem = { label: string; href: string }

export default function Home() {
  return (
    <main className={"flex w-full bg-background min-h-screen flex-col items-center justify-start"}>
      <div className="container w-full flex flex-col items-center justify-start gap-4 px-4 pt-4">
        <Hero />
      </div>
    </main>
  )
}