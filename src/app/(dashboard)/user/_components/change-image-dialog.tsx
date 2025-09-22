"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Image, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import Avatar from "@/app/_components/users/avatar";

export default function ChangeImageDialog({ className, children }: { className?: string, children?: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const utils = api.useUtils();
  const changeAvatar = api.users.changeAvatar.useMutation({
    onSuccess: async () => {
      await utils.users.get.invalidate();
      setFile(null);
      setPreviewUrl(null);
      setOpen(false);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Noe gikk galt ved endring av profilbilde");
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
      changeAvatar.mutate({ fileId: json.data?.id }); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center"><Image className="size-6" size={6} /> Endre profilbilde</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="image-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {previewUrl && (
            <div className="relative max-h-40 w-40 aspect-square overflow-hidden rounded-md">
              <Avatar
                src={previewUrl}
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

          <Button type="submit" disabled={!file && changeAvatar.isPending} className={`bg-indigo-600 hover:bg-indigo-500 text-white ${colors.components.dialog.button}`}>
            {changeAvatar.isPending ? "Lagrer..." : "Lagre profilbilde"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
