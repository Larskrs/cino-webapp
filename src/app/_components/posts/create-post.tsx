"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Image, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import Video from "../video";
import type { Session } from "next-auth";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 125 * 1024 * 1024; // 50MB

export default function CreatePostDialog({
  className,
  session,
  parentId,
  children,
  onClick,
}: {
  session: Session | null;
  parentId?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const utils = api.useUtils();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean; name: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  const maxLength = 512;
  const remaining = maxLength - body.length;

  // create previews for selected files
  useEffect(() => {
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
      name: file.name,
    }));
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.list.invalidate();
      await utils.post.replies.invalidate();
      setBody("");
      setFiles([]);
      setErrorMsg("");
      setOpen(false);
    },
    onError: (error) => {
      setErrorMsg(error.message || "Et ukjent problem oppstod!");
    },
  });

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createPost.isPending) return; // ⛔ prevent double submit

    let attachments: { url: string; type: "image" | "video"; alt: string }[] = [];

    for (const file of files) {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/v1/files", { method: "POST", body: data });
      const json = await res.json();

      if (json.url) {
        attachments.push({
          url: json.url,
          alt: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
        });
      }
    }

    createPost.mutate({ body, attachments, parentId });
  };

  const { colors } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        <div onClick={onClick}>{children}</div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentId !== undefined ? "Svar på innlegg" : "Nytt innlegg"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
          <Textarea
            placeholder={parentId ? "Skriv et svar…" : "Hva vil du dele i dag?"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="sm:text-md md:text-lg lg:text-xl"
            maxLength={maxLength}
          />

          {/* File input trigger */}
          <div className="flex items-center justify-between">
            <label htmlFor="post-file-input" className="cursor-pointer flex items-center gap-2 text-muted-foreground">
              <Image className="size-6" /> Legg til bilder/video
            </label>
            <span
              className={cn(
                "text-sm",
                remaining <= 10 ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              {remaining} gjenstående...
            </span>
          </div>

          {/* Hidden file input */}
          <input
            id="post-file-input"
            className="sr-only"
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={createPost.isPending}
            onChange={(e) => {
              const newFiles = Array.from(e.target.files ?? []);
              const combined = [...files, ...newFiles];
            
              // limit by number
              if (combined.length > MAX_FILES) {
                setErrorMsg(`Du kan maks laste opp ${MAX_FILES} filer.`);
                return;
              }
            
              // limit by total size
              const totalSize = combined.reduce((sum, f) => sum + f.size, 0);
              if (totalSize > MAX_TOTAL_SIZE) {
                setErrorMsg(
                  `Samlet filstørrelse kan ikke overstige ${Math.round(
                    MAX_TOTAL_SIZE / (1024 * 1024)
                  )}MB.`
                );
                return;
              }
            
              setErrorMsg("");
              setFiles(combined);
            }}
          />

          {/* Previews carousel */}
          {previews.length > 0 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
                  {preview.isVideo ? (
                    <Video src={preview.url} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errorMsg && <Label className="text-red-500 text-sm">{errorMsg}</Label>}

          <Button
            type="submit"
            className={cn(
              "cursor-pointer",
              colors.components.dialog.button,
              "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
            disabled={createPost.isPending || !body}
          >
            {createPost.isPending ? "Publiserer..." : "Publiser"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
