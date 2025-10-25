"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { SingleFileUploader, type UploadedFile } from "@/app/_components/files/file-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function ChangeProjectImageDialog({
  projectId,
  currentImage,
  onUpload,
  children,
}: {
  projectId: string;
  currentImage?: string | null;
  onUpload?: (url: string) => void
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);

  const utils = api.useUtils();

  const changeImage = api.projects.change_image.useMutation({
    onSuccess: (data) => {
      setPreview(data.imageUrl ?? null);
      utils.projects.get.invalidate({ projectId });
      toast.success("Project image updated");
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Project Image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">

          <SingleFileUploader
            accept="image/*"
            onUpload={(uploaded: UploadedFile) => {
              if (!uploaded?.url) return;
              setPreview(uploaded.url); // For preview purposes only
              changeImage.mutate({
                projectId,
                fileId: uploaded.id,
              });
            }}
          />

          {preview && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                changeImage.mutate({ projectId, fileId: null });
              }}
            >
              Remove Image
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
