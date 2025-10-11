"use client"

import { formatFileSize } from "@/lib/utils"

export default function Page() {
  const session = useSession()

  return (
    <div className="min-h-screen flex flex-col thin-scrollbar">
      <div className="p-6 pb-0">
        <h1 className="text-2xl text-neutral-300 font-semibold">
          Hei {session?.data?.user.name}.
        </h1>
        <p className="text-neutral-400 text-lg mt-1">
          Velkommen til ditt dashboard
        </p>
      </div>

      <div className="flex-1 relative">
        <div className="relative p-6 inset-0 flex flex-col gap-4 min-h-full h-full">
          <div className="flex flex-col lg:flex-row overflow-x-auto thin-scrollbar gap-4 w-full min-h-75">
            <div className="w-full lg:w-1/3 h-75 lg:min-w-100 bg-neutral-900 rounded-xl">
            </div>
            <div className="w-full lg:w-1/3 h-75 lg:min-w-100 bg-neutral-900 rounded-xl">
            </div>
            <div className="w-full lg:w-1/3 h-75 lg:min-w-100 bg-neutral-900 rounded-xl overflow-hidden p-2">
              <ProjectList />
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full h-150">
            <div className="flex-1 w-1/2 min-w-200 bg-neutral-900 rounded-xl">
            </div>
            <div className="w-1/5 min-w-100 bg-neutral-900 rounded-xl overflow-hidden p-2">
              <FileList />
            </div>
          </div>
{/* 
          <div className="col-start-1 col-end-10 row-start-4 row-end-9 bg-neutral-900 rounded-xl">
            
          </div>

          <div className="col-start-10 col-end-13 row-start-4 row-end-9 bg-neutral-900 rounded-xl">
            
          </div>

          <div className="col-start-10 col-end-13 row-start-4 row-end-9 bg-neutral-900 rounded-xl">
            
          </div>

          <div className="col-start-1 col-end-13 row-start-9 row-end-13 bg-neutral-900 rounded-xl">
            
          </div> */}
        </div>
      </div>
    </div>
  )
}

import { api } from "@/trpc/react"
import { ChevronLeft, ChevronRight, Folder } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

function FileList () {
  const [page, setPage] = useState(1)
  const perPage = 12

  // Fetch paginated data from tRPC
  const { data, isLoading } = api.files.list.useQuery({ page, per_page: perPage })
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll to top when page changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [page])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Laster filer...
      </div>
    )
  }

  if (!data?.items?.length) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Ingen filer funnet.
      </div>
    )
  }

  const { items, total_pages } = data

  return (
    <div className="flex flex-col h-full">
      {/* File List */}
      <div
        ref={listRef}
        className="overflow-y-auto thin-scrollbar grid grid-cols-1 rounded-lg overflow-hidden gap-1 pr-1 flex-1"
      >
        {items.map((f) => (
          <div
            key={f.id}
            className="flex flex-row w-full h-16 rounded-md overflow-hidden relative bg-neutral-800/50 gap-2 items-center"
          >
            <Image
              src={`/api/v1/files?fid=${f.id}`}
              width={64}
              height={64}
              alt="file-preview"
              className="object-cover size-16"
            />
            <div className="flex flex-col gap-1">
              <div className="flex flex-row gap-2">
                <h2 className="text-neutral-300 truncate max-w-[180px]">{f.name}</h2>
              </div>
              <div className="flex flex-row gap-1 items-center">
                {f.createdBy.image && (
                  <Image
                    width={20}
                    height={20}
                    src={f.createdBy.image}
                    alt=""
                    className="size-5 rounded-full border border-neutral-900"
                  />
                )}
                <h2 className="text-neutral-400 text-sm truncate">{f.createdBy.name}</h2>
              </div>
            </div>
            <div className="ml-auto pr-4 text-neutral-400 text-sm">
              {formatFileSize(f.size)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-3">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className="flex items-center px-3 py-1 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          <ChevronLeft size={18}/> Forrige
        </button>

        <span className="text-neutral-400 text-sm">
          Side {page} av {total_pages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, total_pages))}
          disabled={page >= total_pages}
          className="flex items-center px-3 py-1 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          Neste <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  )
}

function ProjectList() {
  const [page, setPage] = useState(1)
  const perPage = 6

  const { data: projects, isLoading } = api.projects.list.useQuery()
  const listRef = useRef<HTMLDivElement>(null)

  // Paginate client-side (since route returns all)
  const total_pages = projects ? Math.ceil(projects.length / perPage) : 1
  const start = (page - 1) * perPage
  const end = start + perPage
  const visibleProjects = projects?.slice(start, end) ?? []

  // Auto scroll to top when changing page
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [page])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Laster prosjekter...
      </div>
    )
  }

  if (!projects?.length) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Ingen prosjekter funnet.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project List */}
      <div
        ref={listRef}
        className="overflow-y-auto thin-scrollbar grid grid-cols-1 rounded-lg overflow-hidden gap-2 pr-1 flex-1"
      >
        {visibleProjects.map((p) => (
          <div
            key={p.id}
            className="h-fit flex flex-row items-center gap-3 bg-neutral-800/50 rounded-md p-2 hover:bg-neutral-800 transition"
          >
            <div className="flex items-center justify-center size-12 bg-neutral-900 rounded-md">
              <Folder className="text-neutral-400" size={20} />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-neutral-200 font-medium truncate">{p.name}</h2>
              <p className="text-neutral-500 text-sm truncate">
                {p.description || "Ingen beskrivelse"}
              </p>
            </div>

            {/* Member Avatars */}
            <div className="flex -space-x-2">
              {p.members.slice(0, 3).map((m) => (
                <Image
                  key={m.user.id}
                  src={m.user.image || "/default-avatar.png"}
                  alt={m.user.name || ""}
                  width={24}
                  height={24}
                  className="rounded-full border border-neutral-900"
                />
              ))}
              {p.members.length > 3 && (
                <div className="flex items-center justify-center size-6 rounded-full bg-neutral-700 text-xs text-neutral-300">
                  +{p.members.length - 3}
                </div>
              )}
            </div>

            {/* Counters */}
            <div className="ml-auto text-right pr-2 text-neutral-400 text-xs">
              <p>{p._count.files} filer</p>
              <p>{p._count.scripts} skript</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-3">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className="flex items-center px-3 py-1 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          <ChevronLeft size={18}/> Forrige
        </button>

        <span className="text-neutral-400 text-sm">
          Side {page} av {total_pages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, total_pages))}
          disabled={page >= total_pages}
          className="flex items-center px-3 py-1 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          Neste <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  )
}