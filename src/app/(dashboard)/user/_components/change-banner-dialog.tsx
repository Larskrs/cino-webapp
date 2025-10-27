"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import FilePickerDialog from "@/app/_components/files/file-picker";
import type { UploadedFile } from "@/app/_components/files/file-upload";

export default function ChangeBannerDialog({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const utils = api.useUtils();
  const { colors } = useTheme();

  const changeBanner = api.users.changeBanner.useMutation({
    onSuccess: async () => {
      await utils.users.get.invalidate();
      toast.success("Banner updated!");
      setOpen(false);
      setPreview(null);
    },
    onError: (err) => {
      toast.error(err.message || "Noe gikk galt ved endring av banner");
    },
  });

  const handleUpload = async (files: UploadedFile[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (!file) return
    setPreview(file.url);
    changeBanner.mutate({ fileId: file.id });
  };

  return (
    <FilePickerDialog
      entityType="user"
      maxFiles={1}
      type="image"
      accept="image/*"
      title="Velg eller last opp nytt banner"
      currentFiles={preview ? [preview] : null}
      onUpload={handleUpload}
      onClose={() => setOpen(false)}
    >
      <Button
        variant="outline"
        className="w-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        Change Banner
      </Button>
    </FilePickerDialog>
  );
}
