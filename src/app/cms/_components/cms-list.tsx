"use client"

import { api } from "@/trpc/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function ContainerOrEpisodeList() {
  const containerQuery = api.media.list_containers.useQuery({
    limit: 12,
    isPublic: null,
  })

  const episodesQuery = api.media.admin_list_recent_episodes.useQuery()

  const isLoading =
    containerQuery.isLoading || episodesQuery.isLoading

  const containers = containerQuery.data?.items ?? []

  const router = useRouter()

  return (
    <div className="space-y-6 w-full max-w-none">
      {isLoading && <p>Laster inn…</p>}

      {!isLoading && (
        <div className="w-full overflow-x-auto border-b">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="px-3 py-2 text-left">{""}</th>
                <th className="px-3 py-2 text-left">id</th>
                <th className="px-3 py-2 text-left">type</th>
                <th className="px-3 py-2 text-left">isPublic</th>
                <th className="px-3 py-2 text-left">createdAt</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr
                  key={container.id}
                  className="border-t cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push("/cms/" + container.id)}
                >
                  <td className="px-3 py-4 font-mono">
                    <Image
                      src={container.logo ?? "https://placehold.co/160x90/png?text=Mangler+logo"}
                      alt={container.title}
                      width={300}
                      height={150}
                      className="h-18 w-36 object-left object-contain"
                    />
                  </td>
                  <td className="px-3 py-4 font-mono">
                    {container.id}
                  </td>
                  <td className="px-3 py-2">
                    {container.type}
                  </td>
                  <td className="px-3 py-2">
                    {String(container.isPublic)}
                  </td>
                  <td className="px-3 py-2">
                    {container.createdAt
                      ? new Date(container.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
