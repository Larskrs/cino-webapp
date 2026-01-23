import { NextRequest } from "next/server"
import QRCode from "qrcode"
import sharp from "sharp"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

// 🔒 Hard-coded logo
const LOGO_PATH = path.join(process.cwd(), "/public/tv-inn/logo.png")

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const link = searchParams.get("link")

  if (!link) {
    return new Response("Missing link", { status: 400 })
  }

  // Defaults (logo-driven)
  const logoWidth = 360
  const logoHeight = 65

  const padding = 32

  const cutoutWidth = logoWidth + padding
  const cutoutHeight = logoHeight + padding

  // 1️⃣ Generate QR (white on transparent)
  const qrBuffer = await QRCode.toBuffer(link, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1024,
    color: {
      dark: "#ffffff",
      light: "#00000000",
    },
  })

  // 2️⃣ Load & resize logo
  const logo = await sharp(fs.readFileSync(LOGO_PATH))
    .resize(logoWidth, logoHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  // 3️⃣ Create rectangular transparent mask
  const cutoutMask = await sharp({
    create: {
      width: cutoutWidth,
      height: cutoutHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer()

  // 4️⃣ Remove QR modules inside mask
  const qrWithHole = await sharp(qrBuffer)
    .composite([
      {
        input: cutoutMask,
        gravity: "center",
        blend: "dest-out",
      },
    ])
    .png()
    .toBuffer()

  // 5️⃣ Draw logo on top (centered)
  const finalImage = await sharp(qrWithHole)
    .composite([
      {
        input: logo,
        gravity: "center",
      },
    ])
    .png()
    .toBuffer()

  return new Response(finalImage as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
