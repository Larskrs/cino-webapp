"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EditSeasonDialogProps {
  season: { id: string; title: string | null; containerId: string };
  children?: ReactNode;
}

export function EditSeasonDialog({ season, children }: EditSeasonDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(season.title || "");
  const [error, setError] = useState<string | null>(null);

  const utils = api.useContext();
  const updateSeason = api.media.update_season.useMutation({
    onSuccess: () => {
      utils.media.list_seasons.invalidate({ containerId: season.containerId });
      setOpen(false);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Sesongtittel kan ikke være tom");
      return;
    }
    updateSeason.mutate({ id: season.id, title });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" onClick={() => setOpen(true)}>
            Rediger sesong
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger Sesong</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <p className="mb-2 -mt-2 text-xs">{season.id}</p>
            <label className="block text-sm font-medium mb-1">
              Sesongtittel
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="f.eks. Sesong 1"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={updateSeason.isPending}
            className="w-full"
          >
            {updateSeason.isPending ? "Lagrer..." : "Lagre endringer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
