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
import { Image, PlusSquare, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import Video from "../video";

export default function CreatePostDialog({ className }: { className?: string }) {
  const utils = api.useUtils();
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setIsVideo(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsVideo(file.type.startsWith("video/"));

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.list.invalidate();
      setBody("");
      setFile(null);
      setErrorMsg("");
      setOpen(false);
    },
    onError: (error) => {
      setErrorMsg(error.message || "Failed to create post");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let attachments: { url: string; type: "image" | "video", alt: string }[] = [];

    if (file) {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/v1/files", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.url) {
        // keep existing behavior (localhost prefix)
        attachments.push({
          url: "http://localhost:3000" + json.url,
          alt: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
        });
      }
    }

    createPost.mutate({ body, attachments });
  };

  const { colors } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        <Button className={colors.components.dialog.button}>
          <PlusSquare />
          Write Post
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
          <Textarea
            placeholder="Post content..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={125}
          />

          {/* Hidden native file input */}
          <input
            id="post-file-input"
            className="sr-only"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
            }}
          />

          {/* Square image icon acting as file input trigger */}
          {!file && <label htmlFor="post-file-input" className="inline-block w-fit">
            <div
              className={cn(
                "flex items-center justify-center cursor-pointer",
                file ? "border-transparent" : "border-zinc-800"
              )}
              aria-hidden
            >
              {!file ? (
                <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                  <Image className="size-6" />
                </div>
              ) : (
                <div className="w-full h-full" aria-hidden />
              )}
            </div>
          </label>}

          {/* Preview (image or video) */}
          {previewUrl && (
            <div className="relative w-full max-w-md">
              <div className="relative rounded-md overflow-hidden bg-gray-100">
                {isVideo ? (
                  <Video
                    src={previewUrl}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <img src={previewUrl} alt="preview" className="w-full h-auto object-cover" />
                )}

                {/* remove button: semi-opaque black circle with X */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <div
                    onClick={() => setFile(null)}
                    className={cn("cursor-pointer bg-black/50 text-white px-3 text-sm py-1 rounded-full flex items-center justify-center")}
                    aria-label="Remove media"
                    >
                    {file?.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className={cn("relative cursor-pointer text-white w-8 h-8 bg-black/50 rounded-full flex items-center justify-center")}
                    aria-label="Remove media"
                    >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && <Label className="text-red-500 text-sm">{errorMsg}</Label>}

          <Button type="submit" className={cn("cursor-pointer", colors.components.dialog.button)} disabled={createPost.isPending || !body}>
            {createPost.isPending ? "Creating..." : "Create Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
