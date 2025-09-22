"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function ChangeBannerDialog({ className, children }: { className?: string, children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const utils = api.useUtils();
  const changeBanner = api.users.changeBanner.useMutation({
    onSuccess: async () => {
      await utils.users.get.invalidate();
      setFile(null);
      setPreviewUrl(null);
      setOpen(false);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Noe gikk galt ved endring av banner");
    },
  });

  const { colors } = useTheme();

  // Preview the selected file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/v1/files", { method: "POST", body: data });
    const json = await res.json();

    if (json.url) {
      changeBanner.mutate({ fileId: json.data?.id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>Endre banner</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Endre Bannerbilde</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="banner-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {previewUrl && (
            <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: "3 / 1" }}>
              <img
                src={previewUrl}
                alt="banner preview"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMsg && <Label className="text-red-500">{errorMsg}</Label>}

          <Button type="submit" disabled={!file} className={`bg-indigo-600 hover:bg-indigo-500 text-white ${colors.components.dialog.button}`}>
            {changeBanner.isPending ? "Lagrer..." : "Lagre banner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
