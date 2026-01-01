import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useState, type FormEvent, type ReactNode } from "react";
import FilePickerDialog from "@/app/_components/files/file-picker";

interface EditEpisodeDialogProps {
  episode: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    videoSrc?: string | null;
    episodeNumber?: number | null;
    seasonId: string;
    episodeCount?: number; // placeholder suggestion
  };
  children?: ReactNode;
}

export function EditEpisodeDialog({ episode, children }: EditEpisodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState<"thumbnail" | "video" | null>(null);
  const [title, setTitle] = useState(episode.title);
  const [description, setDescription] = useState(episode.description ?? "");
  const [thumbnail, setThumbnail] = useState(episode.thumbnail ?? "");
  const [videoSrc, setVideoSrc] = useState(episode.videoSrc ?? "");
  const [episodeNumber, setEpisodeNumber] = useState(episode.episodeNumber ?? episode.episodeCount ?? 1);

  const utils = api.useContext();
  const updateEpisode = api.media.update_episode.useMutation({
    onSuccess: () => {
      utils.media.list_episodes.invalidate({ seasonId: episode.seasonId });
      setOpen(false);
    },
  });

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    updateEpisode.mutate({
      id: episode.id,
      title,
      description,
      thumbnail,
      videoSrc,
      episodeNumber,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children ?? (
            <Button onClick={() => setOpen(true)}>Rediger Episode</Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger Episode</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tittel</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Beskrivelse</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
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
              <label className="block text-sm font-medium mb-1">Videokilde</label>
              <div className="flex gap-2">
                <Input value={videoSrc} onChange={(e) => setVideoSrc(e.target.value)} />
                <Button type="button" variant="secondary" onClick={() => {
                  setOpen(false);
                  setShowFilePicker("video");
                }}>
                  Velg
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Episodenummer</label>
              <Input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                placeholder={episode.episodeCount?.toString()}
              />
            </div>

            {updateEpisode.error && (
              <p className="text-sm text-red-600">{updateEpisode.error.message}</p>
            )}

            <Button type="submit" disabled={updateEpisode.isPending} className="w-full">
              {updateEpisode.isPending ? "Lagrer..." : "Lagre endringer"}
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
