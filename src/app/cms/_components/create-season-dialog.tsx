"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateSeasonDialogProps {
  containerId: string;
  seasonCount: number;
  children?: ReactNode;  // optional custom trigger element
}

export function CreateSeasonDialog({ containerId, seasonCount=0, children }: CreateSeasonDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Sesong " + (seasonCount + 1));
  const [seasonNumber, setSeasonNumber] = useState(seasonCount+1);
  const [description, setDescription] = useState("");

  const utils = api.useContext();  // TRPC context for cache invalidation
  const createSeason = api.media.create_season.useMutation({
    onSuccess: () => {
      // Invalidate the season list for this container to refresh the UI
      utils.media.list_seasons.invalidate({ containerId });
      // Reset form and close dialog
      setTitle("Sesong " + (seasonCount + 1));
      setSeasonNumber(seasonCount + 1);
      setDescription("");
      setOpen(false);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Call mutation to create a season with the given name
    createSeason.mutate({ title, containerId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* DialogTrigger: if a custom trigger is provided via children, use it; otherwise default to a button */}
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" onClick={() => setOpen(true)}>
            New Season
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Season</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Season Name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Season 1"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Season Number</label>
            <Input
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(Number(e.target.value))}
              placeholder="e.g. 1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A brief description of the season"
              required
            />
          </div>
          {createSeason.error && (
            <p className="text-sm text-red-600">{createSeason.error.message}</p>
          )}
          <Button type="submit" disabled={createSeason.isPending} className="w-full">
            {createSeason.isPending ? "Creating..." : "Create Season"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
