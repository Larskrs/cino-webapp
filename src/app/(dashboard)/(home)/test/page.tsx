import { ServerBlocks } from "@/blocks/renderers/server-blocks"

let HomePageJSON: unknown = null

try {
  HomePageJSON = (await import("@/../home.page.json")).default
} catch (error) {
  console.error("[HomePageJSON] Failed to load or parse JSON", error)
}

function isValidBlocks(value: unknown): value is any[] {
  return Array.isArray(value)
}

export default async function Page() {
  if (!HomePageJSON) {
    return (
      <div className="p-6 text-muted-foreground">
        Failed to load page configuration
      </div>
    )
  }

  if (!isValidBlocks(HomePageJSON)) {
    console.error("[HomePageJSON] Invalid blocks format", HomePageJSON)

    return (
      <div className="p-6 text-red-500">
        Page configuration is invalid
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-32 gap-16">
      <ServerBlocks blocks={HomePageJSON} />
    </div>
  )
}
