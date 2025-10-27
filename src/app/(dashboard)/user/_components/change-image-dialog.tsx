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
import Avatar from "@/app/_components/users/avatar";
import { motion } from "framer-motion"
import { CameraIcon } from "lucide-react";

export default function ChangeAvatarDialog({
  className,
  children,
  defaultValue,
}: {
  className?: string;
  defaultValue?: string,
  children: React.ReactNode;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const utils = api.useUtils();

  const changeAvatar = api.users.changeAvatar.useMutation({
    onSuccess: async () => {
      await utils.users.get.invalidate();
      toast.success("Avatar updated!");
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
    changeAvatar.mutate({ fileId: file.id });
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
    >
      <div className="z-10 group cursor-pointer relative max-h-50 w-36 sm:w-40 lg:w-52 border-6 border-neutral-100 dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-950 aspect-square overflow-hidden rounded-full">
        <Avatar
          height={512}
          width={512}
          quality={100}
          src={preview || defaultValue || null}
          className="transition-all group-hover:scale-95 object-cover w-full h-full"
        />
        <div>
          <CameraIcon strokeWidth={2} className="opacity-0 group-hover:opacity-75 absolute left-1/2 top-1/2 size-1/2 -translate-1/2 text-white" />
        </div>
      </div>
    </FilePickerDialog>
  );
}
