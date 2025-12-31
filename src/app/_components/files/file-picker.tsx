"use client";

import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { MultiFileUploader, type UploadedFile } from "@/app/_components/files/file-upload";
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
import mime from "mime-types"

/* -------------------------------------------------------------------------- */
/*                                Component Props                             */
/* -------------------------------------------------------------------------- */

interface FilePickerDialogProps {
  /** Optional — used for direct API binding like changing project image */
  entityId?: string;
  entityType?: "project" | "post" | "user" | string;

  openDefault?: boolean

  /** File restrictions */
  maxFiles?: number;
  accept?: string;
  type?: "image" | "video";

  /** Optional — preselected or current image URL */
  currentFiles?: string[] | null;

  /** Called when upload(s) complete */
  onUpload?: (files: UploadedFile[]) => void;

  onClose?: () => void;

  /** Custom dialog trigger */
  children?: ReactNode;

  /** Title override */
  title?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function FilePickerDialog({
  entityId,
  entityType = "generic",
  maxFiles = 1,
  accept = "image/*,video/*",
  type = "image",
  openDefault = false,
  currentFiles = null,
  onUpload,
  onClose,
  children,
  title = "Select or Upload Files",
}: FilePickerDialogProps) {
  const [open, setOpen] = useState(openDefault);
  const [tab, setTab] = useState("select");
  const [preview, setPreview] = useState<string | null>(
    currentFiles?.[0] ?? null
  );

  const utils = api.useUtils();
  const { colors } = useTheme();

  const isSingle = maxFiles === 1;

  /* -------------------------------- Mutations ------------------------------- */
  const changeProjectImage = api.projects.change_image.useMutation({
    onSuccess: (data) => {
      utils.projects.get.invalidate({ projectId: entityId! });
      toast.success("Image updated");
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  /* -------------------------------- Fetch existing ------------------------------- */
  const [files] = api.files.list.useSuspenseQuery({
    per_page: 50,
    type: type
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={(open) => {
        setOpen(open);
        if (!open) onClose?.()
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList
            className={cn(
              "grid w-full mb-4",
              isSingle ? "grid-cols-2" : "grid-cols-2"
            )}
          >
            <TabsTrigger value="upload">Upload new</TabsTrigger>
            <TabsTrigger value="select">Select existing</TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------------------------ */}
          {/* SELECT EXISTING TAB */}
          {/* ------------------------------------------------------------------ */}
          <TabsContent value="select">
            <div
              className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1 rounded-md",
                colors.cardBackground,
                "border border-neutral-200 dark:border-neutral-700"
              )}
            >
              {files.total === 0 && (
                <p className="col-span-full text-center text-sm text-neutral-500 dark:text-neutral-400 py-6">
                  No uploaded files yet
                </p>
              )}

              {files.items?.map((file) => {
                const url = `/api/v1/files?fid=${file.id}`;
                const selected = preview === url;

                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      if (isSingle) {
                        setPreview(url);
                        onUpload?.([
                          {
                            id: file.id,
                            url,
                            type: "image",
                            name: file.name ?? "File",
                          },
                        ]);
                        if (entityType === "project") {
                          changeProjectImage.mutate({
                            projectId: entityId!,
                            fileId: file.id,
                          });
                        }
                        setOpen(false);
                      } else {
                        // Multi-select logic could go here
                        toast.info("Multi-select not implemented yet");
                      }
                    }}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden transition-all border-2 outline-2 outline-transparent",
                      selected
                        ? "border-transparent outline-indigo-400"
                        : "border-transparent hover:outline-indigo-100"
                    )}
                  >
                    {mime.lookup(file.name).toString().startsWith("video") ? (
                      <video
                        src={url}
                        className="object-cover w-full h-full"
                        muted
                      />
                    ) : (
                      <Image
                        src={url}
                        alt={file.name ?? "Image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* ------------------------------------------------------------------ */}
          {/* UPLOAD TAB */}
          {/* ------------------------------------------------------------------ */}
          <TabsContent value="upload">
            <div
              className={cn(
                "flex flex-col items-center gap-4",
                !isSingle && "mt-2"
              )}
            >
              <MultiFileUploader
                maxFiles={maxFiles}
                accept={accept}
                onUpload={(uploadedFiles) => {
                  onUpload?.(uploadedFiles);

                  if (isSingle && uploadedFiles[0]) {
                    const uploaded = uploadedFiles[0];
                    setPreview(uploaded.url);
                    if (entityType === "project" && entityId) {
                      changeProjectImage.mutate({
                        projectId: entityId,
                        fileId: uploaded.id,
                      });
                    }
                  }

                  toast.success(
                    uploadedFiles.length > 1
                      ? `${uploadedFiles.length} files uploaded`
                      : "File uploaded"
                  );
                }}
              />

              {isSingle && preview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (entityType === "project" && entityId) {
                      changeProjectImage.mutate({ projectId: entityId, fileId: null });
                    }
                    setPreview(null);
                    toast.success("Image removed");
                  }}
                >
                  Remove Image
                </Button>
              )}
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
