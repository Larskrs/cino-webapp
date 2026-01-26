"use server"

import { cn } from "@/lib/utils"
import Image from "next/image"
import type { ReactNode } from "react"

export default async function Layout ({children}:{children: ReactNode}) {
  return <div className="p-4 grid-rows-3 xl:grid-rows-1 items-center justify-center xl:p-0 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 bg-background grid w-full h-[100dvh]">

    <main className={cn(
      "px-8 py-12 rounded-xl z-1",
      "flex flex-col items-center justify-start",
      "w-full h-full mx-auto row-start-1 row-end-4 lg:row-start-3 xl:row-start-1 xl:row-end-1",
      "xl:w-full xl:h-full xl:relative"
    )}>
      {children}
    </main>

    <div className="absolute inset-0 h-full xl:relative z-0 p-0 xl:p-8 col-span-1 2xl:col-span-2">
      <Image
        src={"/api/v1/image/containers"}
        alt="hero-artwork"
        width={1920}
        height={1080}
        quality={100}
        className="w-full h-full object-cover lg:rounded-2xl z-2"
      />
    </div>
  </div>
}