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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import Image from "next/image";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export default function ChangeProjectImageDialog({
  projectId,
  currentImage,
  onUpload,
  children,
}: {
  projectId: string;
  currentImage?: string | null;
  onUpload?: (url: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("upload");
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);

  const utils = api.useUtils();
  const { colors } = useTheme();

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

  const [files] = api.files.list.useSuspenseQuery(
    { type: "image", per_page: 50 },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Project Image</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="upload">Upload new</TabsTrigger>
            <TabsTrigger value="select">Select existing</TabsTrigger>
          </TabsList>

          {/* UPLOAD TAB */}
          <TabsContent value="upload">
            <div className="flex flex-col items-center gap-4">
              <SingleFileUploader
                accept=".png,.jpg,.jpeg,.webp"
                onUpload={(uploaded: UploadedFile) => {
                  if (!uploaded?.url) return;
                  setPreview(uploaded.url);
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
          </TabsContent>

          {/* SELECT EXISTING TAB */}
          <TabsContent value="select">
            <div
              className={cn(
                "grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1 rounded-md",
                colors.cardBackground,
                "border border-neutral-200 dark:border-neutral-700"
              )}
            >
              {files.total === 0 && (
                <p className="col-span-full text-center text-sm text-neutral-500 dark:text-neutral-400 py-6">
                  No uploaded images yet
                </p>
              )}

              {files.items?.map((file) => {

                const url = `/api/v1/files?fid=${file.id}`

                return (
                  <button
                    key={file.id}
                    onClick={() =>
                      changeImage.mutate({ projectId, fileId: file.id })
                    }
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden transition-all border-2",
                      preview === url
                        ? "border-indigo-500 ring-2 ring-indigo-400"
                        : "border-transparent hover:border-indigo-300"
                    )}
                  >
                    <Image
                      src={url}
                      alt={file.name ?? "Image"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
