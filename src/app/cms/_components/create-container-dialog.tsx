"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { MediaType } from "@prisma/client";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface ContainerDialogProps {
  container?: {
    id: string;
    title: string;
  };
  onSuccess?: () => void;
  triggerLabel?: string | LucideIcon;
  className?: string;
}

export default function ContainerDialog({ container, onSuccess, triggerLabel = "Legg til nytt medie", className }: ContainerDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(container?.title ?? "");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<MediaType>("MOVIE");
  const [description, setDescription] = useState("");

  const router = useRouter()

  const createContainer = api.media.create_container.useMutation({
    onSuccess: () => {
      toast.success("Medie opprettet");
      setOpen(false);
      onSuccess?.();
      router.push("/cms/"+slug)
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteContainer = api.media.delete_container.useMutation({
    onSuccess: () => {
      toast.success("Medie slettet");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createContainer.mutate({
      title,
      slug,
      type,
      description: description || undefined,
    });
  };

  const handleDelete = () => {
    if (!container) return;
    if (confirm(`Er du sikker på at du vil slette "${container.title}"?`)) {
      deleteContainer.mutate({ id: container.id });
    }
  };

  const Icon = triggerLabel

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn(className)} variant={container ? "opposite" : "default"}>{typeof triggerLabel === "string" ? triggerLabel : <Icon />}</Button>
      </DialogTrigger>

        <DialogContent className="max-h-[90dvh] overflow-y-auto border-0" style={{
          background: "var(--background)",
          color: "var(--accent)"
        }}>
        <DialogHeader>
          <DialogTitle className="text-primary">{container ? "Slett mediet" : "Nytt medie"}</DialogTitle>
        </DialogHeader>

        {container ? (
          <div className="space-y-4">
            <p>Du er i ferd med å slette <strong>{container.title}</strong>.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteContainer.isPending}>
                {deleteContainer.isPending ? "Sletter..." : "Slett"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Tittel</Label>
              <Input value={title} onChange={(e) => {
                setTitle(e.target.value)
                setSlug(slugify(e.target.value))
              }} placeholder="Mitt nye medie" required />
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mitt-nye-medie"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                required
              />
            </div>

            <div>
              <Label>Beskrivelse</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MediaType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MediaType).map((mt) => (
                    <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createContainer.isPending} className="w-full">
                {createContainer.isPending ? "Lagrer..." : "Opprett"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
