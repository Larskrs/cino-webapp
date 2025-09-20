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
import { Card } from "@/components/ui/card";
import Avatar from "../users/avatar";
import type { Session } from "next-auth";

export default function CreatePostDialog({ className, session }: { className?: string , session: Session}) {
  const utils = api.useUtils();
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
  }

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
      setErrorMsg(error.message || "Et ukjent problem oppstod under publisering av innlegg!");
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
          url: "/" + json.url,
          alt: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
        });
      }
    }

    createPost.mutate({ body, attachments });
  };

  const { colors } = useTheme()

  const maxLength = 512

  const remaining = maxLength ? maxLength - body.length : null
  const progress =
    maxLength && maxLength > 0 ? Math.min((body.length / maxLength) * 100, 100) : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        <Card
          className={cn(
            "flex items-start gap-3 mb-8 mt-4 px-4 pt-3 pb-4 shadow-none border-none rounded-xl",
            colors.cardBackground,
          )}

        >
          <div className="flex flex-col flex-1 w-full">
            {/* Top row: author + timestamp */}
            <div className="flex flex-row gap-4">
              <Avatar
                className="size-12 mt-1.5 shrink-0 rounded-full"
                src={session?.user?.image || ""}
              />
              <div className="flex flex-col w-full">
                          <div
                            className={`flex items-center gap-2 text-lg ${colors.textMuted}`}
                          >
                            <span className={`font-semibold ${colors.text}`}>
                              {session.user.name}
                            </span>
                          </div>
              
                          {/* Body text */}
                          <p
                            className={cn("mt-1 px-4 py-3 text-lg leading-snug whitespace-pre-line break-words cursor-pointer rounded-md", colors.textMuted, colors.buttonBackground, colors.cardBorder)}
                          >
                            Hva vil du dele i dag?
                          </p>
                </div>
            </div>
        </div>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nytt Innlegg</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-1">
          <Textarea
            placeholder="Hva vil du dele i dag?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="sm:text-md md:text-lg lg:text-xl"
            maxLength={512}
          />

          <div
            key="char-counter"
            className="flex gap-4 items-center mb-2"
          >
            <div className="flex flex-row gap-1 mr-auto">
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
            </div>

            {/* Remaining text */}
            <div
              className={cn(
                "text-md text-muted-foreground ml-auto flex",
                remaining !== null && remaining <= 10
                  ? "text-destructive font-medium"
                  : ""
              )}
            >
              {remaining}  gjenstående...
            </div>
          </div>

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

          <Button type="submit" className={cn("cursor-pointer", colors.components.dialog.button, "bg-indigo-600 hover:bg-indigo-500 text-white")} disabled={createPost.isPending || !body}>
            {createPost.isPending ? "publiserer..." : "Publiser"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
