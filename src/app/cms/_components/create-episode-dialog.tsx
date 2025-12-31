"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilePickerDialog from "@/app/_components/files/file-picker";

interface CreateEpisodeDialogProps {
  seasonId: string;
  children?: ReactNode;
}

export function CreateEpisodeDialog({ seasonId, children }: CreateEpisodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("")
  const [videoSrc, setVideoSrc] = useState("");
  const [showFilePicker, setShowFilePicker] = useState<"thumbnail" | "video" | null>(null);

  const utils = api.useContext();
  const createEpisode = api.media.create_episode.useMutation({
    onSuccess: () => {
      utils.media.list_episodes.invalidate({ seasonId });
      setTitle("");
      setVideoSrc("");
      setThumbnail("")
      setOpen(false);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createEpisode.mutate({ title, seasonId, videoSrc, thumbnail });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" onClick={() => setOpen(true)}>
            Ny Episode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Episode</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Episode Tittel</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode tittel"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
            <div className="flex gap-2">
              <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
              <Button type="button" variant="secondary" onClick={() => {
                setOpen(false);
                setShowFilePicker("thumbnail");
              }}>
                Velg
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
                Video Kilde
                <span className="text-xs text-muted-foreground"> (kan bli lagt til senere)</span>
            </label>
            <Input 
              value={videoSrc}
              onChange={(e) => setVideoSrc(e.target.value)}
              placeholder="Video source URL"
            />
          </div>
          {createEpisode.error && (
            <p className="text-sm text-red-600">{createEpisode.error.message}</p>
          )}
          <Button type="submit" disabled={createEpisode.isPending} className="w-full">
            {createEpisode.isPending ? "Oppretter til..." : "Opprett Episode"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>


      <FilePickerDialog
        title={showFilePicker ?? "ukjent problem"}
        key={showFilePicker}
        openDefault={showFilePicker != null}
        type={showFilePicker == "thumbnail" ? "image" : "video"}
        onUpload={(files) => {
          const url = files[0]?.url;
          if (!url) return;
          if (showFilePicker === "thumbnail") setThumbnail(url);
          if (showFilePicker === "video") setVideoSrc(url);
          setShowFilePicker(null);
          setTimeout(() => setOpen(true), 100); // delay reopen to allow dialog unmount
        }}
        onClose={() => {
          setShowFilePicker(null);
          setTimeout(() => setOpen(true), 100);
        }}
      />
    </>
  );
}
