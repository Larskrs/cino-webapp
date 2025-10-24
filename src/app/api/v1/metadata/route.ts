import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({
        title: url,
        description: "",
        image: "",
        icon: "",
      });
    }

    const html = await res.text();

    // Simple regex helper
    const matchMeta = (regex: RegExp) => html.match(regex)?.[1]?.trim() || "";

    // --- Title ---
    const title =
      matchMeta(/<meta[^>]+property=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<title[^>]*>([^<]*)<\/title>/i);

    // --- Description ---
    const description =
      matchMeta(/<meta[^>]+property=["']twitter:description["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    // --- Image ---
    const image =
      matchMeta(/<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);

    // --- Icon / Favicon ---
    const icon =
      matchMeta(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i) ||
      matchMeta(/<link[^>]+rel=["']shortcut icon["'][^>]+href=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+property=["']og:logo["'][^>]+content=["']([^"']+)["']/i) ||
      matchMeta(/<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i);

    const normalize = (relative?: string | null) => {
      if (!relative) return null;
      try {
        return new URL(relative, url).href;
      } catch {
        return relative;
      }
    };

    return NextResponse.json({
      title: title || new URL(url).hostname,
      description,
      image: normalize(image),
      icon: normalize(icon),
    });
  } catch (err) {
    console.error("Metadata fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
