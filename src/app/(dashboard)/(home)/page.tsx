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
      <div className="text-neutral-500 p-8 bg-neutral-950 border-neutral-900 border-2 items-center justify-center flex w-fit mx-auto">
        <h1 className="text-3xl">
          Homepage configuration is missing
        </h1>
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
      <div className="text-red-500 p-8 bg-red-950 border-red-900 border-2 items-center justify-center flex w-fit mx-auto">
        <h1 className="text-3xl">
          Homepage configuration is invalid
        </h1>
      </div>
    )
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="bg-background transition-colors duration-700 flex flex-col pb-32 gap-8 xl:gap-16">
      <ServerBlocks blocks={blocks} />
    </div>
  )
}
