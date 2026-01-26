import { NextRequest } from "next/server"
import sharp from "sharp"
import { db } from "@/server/db"

export const runtime = "nodejs"

// Canvas size
const WIDTH = 1920
const HEIGHT = 1080

// Grid config (4 × 3 = 12 items)
const COLS = 4
const ROWS = 3
const GAP = 0
const PADDING = 0

export async function GET(req: NextRequest) {
  // 1️⃣ Fetch public containers
  const containers = await db.mediaContainer.findMany({
    where: {
      isPublic: true
    },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      poster: true,
      banner: true,
    },
    orderBy: { createdAt: "desc" },
    take: COLS * ROWS,
  })

  // 2️⃣ Base canvas
  let canvas = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: "#0a0a0a",
    },
  })

  const cellWidth =
    (WIDTH - PADDING * 2 - GAP * (COLS - 1)) / COLS
  const cellHeight = cellWidth * (9 / 16)

  const composites: sharp.OverlayOptions[] = []

  for (let i = 0; i < containers.length; i++) {
    const c = containers[i]

    const src =
      c?.thumbnail ?? c?.poster ?? c?.banner

    if (!src) continue

    // 🔁 Ensure absolute URLs
    const imageUrl = src.startsWith("http")
      ? src
      : `${process.env.NEXT_PUBLIC_URL}${src}`

          console.log(imageUrl)

    // 3️⃣ Fetch image
    const imageBuffer = await fetch(imageUrl).then(r =>
      r.arrayBuffer()
    )

    // 4️⃣ Resize to exact 16:9 tile
    const resized = await sharp(Buffer.from(imageBuffer))
      .resize(Math.round(cellWidth), Math.round(cellHeight), {
        fit: "cover",
        position: "center",
      })
      .png()
      .toBuffer()

    const col = i % COLS
    const row = Math.floor(i / COLS)

    const left =
      PADDING + col * (cellWidth + GAP)
    const top =
      PADDING + row * (cellHeight + GAP)

    composites.push({
      input: resized,
      left: Math.round(left),
      top: Math.round(top),
    })
  }

  // 5️⃣ Composite all thumbnails
  const finalImage = await canvas
    .composite(composites)
    .png()
    .toBuffer()

  return new Response(finalImage as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
