"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ThemeColor } from "@/app/_components/theme-injection";

import { EditContainerDialog } from "../_components/edit-container-dialog";
import { CreateSeasonDialog } from "../_components/create-season-dialog";
import { EditSeasonDialog } from "../_components/edit-season-dialog";
import { CreateEpisodeDialog } from "../_components/create-episode-dialog";
import { EditEpisodeDialog } from "../_components/edit-episode-dialog";
import Image from "next/image";

interface ContainerPageProps {
  params: Promise<{ container: string }>;
}

export default function ContainerPage({ params }: ContainerPageProps) {
  const containerId = React.use(params).container;

  const { data: container, isLoading: containerLoading } = api.media.get_container.useQuery({ id: containerId });
  const { data: seasons, isLoading: seasonsLoading } = api.media.list_seasons.useQuery({ containerId });

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasons[0]?.id || "");
    }
  }, [seasons, selectedSeasonId]);


  const { data: episodes, isLoading: episodesLoading } = api.media.list_episodes.useQuery(
    { seasonId: selectedSeasonId! },
    { enabled: !!selectedSeasonId }
  );

  useEffect(() => {
    const color = (container?.color as ThemeColor ?? {
      background: "",
      primary: "",
      secondary: "",
      text: ""
    })

    document.documentElement.style.setProperty(
      "--background", color.background
    )
    document.documentElement.style.setProperty(
      "--secondary", color.secondary
    )
    document.documentElement.style.setProperty(
      "--primary", color.primary
    )
  }, [container])

  if (containerLoading) return <p className="p-4">Laster innhold...</p>;
  if (!container) return <p className="p-4 text-red-500">Fant ikke container.</p>;

  return (
    <div className="md:grid md:grid-cols-4 grid-cols-1 gap-6 min-h-screen text-primary bg-background">
      {/* Venstreside: Sesonger */}
      <aside className="md:col-span-1 bg-secondary p-4 flex flex-col max-h-100 overflow-y-auto md:min-h-screen">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold flex items-center justify-between">
            {container.title}
            <EditContainerDialog container={container}>
              <Button className="hover:text-background hover:bg-primary text-primary font-semibold" variant="outline" size="sm">Rediger</Button>
            </EditContainerDialog>
          </h1>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Sesonger</h2>
        </div>

        {seasonsLoading ? (
          <p>Laster sesonger...</p>
        ) : (
          <ul className="space-y-1">
            <CreateSeasonDialog containerId={containerId} seasonCount={seasons?.length ?? 0}>
                <Button className="w-full mb-3 hover:text-background hover:bg-primary bg-background/75 text-primary font-semibold" size="sm">+ Ny</Button>
            </CreateSeasonDialog>

            {seasons?.map((season) => (
              <li key={season.id} className="flex flex-row gap-1">
                <div
                  onClick={() => setSelectedSeasonId(season.id)}
                  className={cn(
                    "px-2 py-1 flex flex-row items-center justify-between cursor-pointer w-full rounded",
                    season.id === selectedSeasonId
                      ? "bg-primary text-background"
                      : "bg-background text-primary hover:bg-background"
                  )}
                >
                  <span className={cn("", season.title ? "opacity-100" : "opacity-50")}>
                    {season.title ?? "Uten navn"}
                  </span>
                  <span className="text-sm">{season._count.episodes}</span>
                </div>
                <EditSeasonDialog season={season}>
                  <Button
                    variant="ghost"
                    className="size-8 rounded-sm text-xs bg-background hover:bg-primary hover:text-background text-primary"
                  >
                    <Edit />
                  </Button>
                </EditSeasonDialog>
              </li>
            ))}
            {seasons && seasons.length === 0 && (
              <li className="text-sm text-neutral-500">Ingen sesonger ennå.</li>
            )}
          </ul>
        )}
      </aside>

      {/* Hovedinnhold: Episoder */}
      <main className="md:col-span-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg text-primary font-medium">Episoder</h2>
          {selectedSeasonId && (
            <CreateEpisodeDialog seasonId={selectedSeasonId}>
              <Button className="text-background font-semibold" size="sm">+ Ny episode</Button>
            </CreateEpisodeDialog>
          )}
        </div>

        {!selectedSeasonId ? (
          <p className="text-sm ">Velg en sesong for å vise episodene.</p>
        ) : episodesLoading ? (
          <p>Laster episoder...</p>
        ) : (
          <ul className="space-y-1">
            {episodes?.map((ep) => (
              <li key={ep.id} className="px-1 py-1 items-center">
                <div className="flex items-center justify-start">
                  <div>
                    <Image
                      src={ep.thumbnail || "https://placehold.co/160x90/png?text=Mangler+bilde"}
                      alt={"mangler bilde"}
                      width={135}
                      height={67}
                      className="rounded aspect-video object-cover"
                    />
                  </div>
                  <div className="flex px-4 flex-col gap-0">
                    <span>{ep.title}</span>
                    <span>{ep.description}</span>
                    <span>{formatExactDateTime(ep.airDate ?? ep.createdAt)}</span>
                  </div>
                  <EditEpisodeDialog episode={ep}>
                    <Button variant="ghost"  className="ml-auto px-4 py-1 bg-secondary mr-2 text-xs text-muted-foreground">
                      Rediger
                    </Button>
                  </EditEpisodeDialog>
                </div>
              </li>
            ))}
            {episodes && episodes.length === 0 && (
              <li className="text-sm text-primary">Ingen episoder i denne sesongen.</li>
            )}
          </ul>
        )}
      </main>
    </div>
  );
}


function formatExactDateTime(date?: string | Date | null) {
  if (!date) return null

  const d = new Date(date)

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = String(d.getFullYear()).slice(-2)

  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${day}.${month}.${year} ${hours}:${minutes}`
}