import { ServerBlocks } from "@/blocks/renderers/server-blocks"
import type { BlockInstance } from "@/blocks/types"
import { db } from "@/server/db" // adjust if your prisma export lives elsewhere

function isValidBlocks(value: unknown): value is any[] {
  return Array.isArray(value)
}

export default async function Page() {
  /* ---------------------------------------------------------------------- */
  /* Load homepage from DB                                                   */
  /* ---------------------------------------------------------------------- */

  const homepage = await db.mediaPage.findFirst({
    where: { categoryId: null },
    select: {
      data: true,
    },
  })

  if (!homepage) {
    return (
      <div className="p-6 text-muted-foreground">
        Homepage is not configured
      </div>
    )
  }

  const blocks = homepage.data as BlockInstance[]

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  if (!isValidBlocks(blocks)) {
    console.error("[Homepage] Invalid blocks format", blocks)

    return (
      <div className="p-6 text-red-500">
        Homepage configuration is invalid
      </div>
    )
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col pb-32 gap-16">
      <ServerBlocks blocks={blocks} />
    </div>
  )
}
