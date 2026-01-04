"use client"

import { useState } from "react";
import { api } from "@/trpc/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EpisodeCard from "./episode-card";
import ContainerCard from "./container-card";

export default function ContainerOrEpisodeList() {
  const [showEpisodes, setShowEpisodes] = useState(false);

  const containerQuery = api.media.list_containers.useQuery({
    limit: 12,
    isPublic: null,
  });

  const episodesQuery = api.media.admin_list_recent_episodes.useQuery();

  const isLoading = containerQuery.isLoading || episodesQuery.isLoading;
  const containers = containerQuery.data?.items ?? [];
  const episodes = episodesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label htmlFor="toggle">Vis episoder</Label>
        <Switch id="toggle" checked={showEpisodes} onCheckedChange={setShowEpisodes} />
      </div>

      {isLoading ? (
        <p>Laster inn...</p>
      ) : showEpisodes ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {containers.map((container) => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      )}
    </div>
  );
}