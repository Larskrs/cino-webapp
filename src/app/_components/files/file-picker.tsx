"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
import mime from "mime-types";

/* -------------------------------------------------------------------------- */
/*                                Component Props                             */
/* -------------------------------------------------------------------------- */

interface FilePickerDialogProps {
  entityId?: string;
  entityType?: "project" | "post" | "user" | string;
  openDefault?: boolean;
  maxFiles?: number;
  accept?: string;
  type?: "image" | "video";
  currentFiles?: string[] | null;
  onUpload?: (files: UploadedFile[]) => void;
  onClose?: () => void;
  children?: ReactNode;
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

  const isSingle = maxFiles === 1;
  const { colors } = useTheme();
  const utils = api.useUtils();

  /* ---------------------------- Pagination state ---------------------------- */
  const [cursor, setCursor] = useState(1);
  const [files, setFiles] = useState<any[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------------- Query ----------------------------------- */
  const { data, isFetching } = api.files.list.useQuery(
    {
      cursor,
      per_page: 24,
      // type,
    },
    {
      enabled: open && tab === "select",
    }
  );

  /* ------------------------- Accumulate results ---------------------------- */
  useEffect(() => {
    if (!data?.items) return;

    setFiles((prev) =>
      cursor === 1 ? data.items : [...prev, ...data.items]
    );
  }, [data, cursor]);

  /* ------------------------- Infinite scroll ------------------------------- */
  useEffect(() => {
    if (!loadMoreRef.current || !data?.nextCursor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && data.nextCursor && !isFetching) {
          setCursor(data.nextCursor);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [data?.nextCursor, isFetching]);

  /* ------------------------------- Mutations ------------------------------- */
  const changeProjectImage = api.projects.change_image.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId: entityId! });
      toast.success("Image updated");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setCursor(1);
          setFiles([]);
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="min-w-[min(75rem,calc(100vw-2rem))] h-[min(65rem,calc(100dvh-2rem))] flex flex-col overflow-y-auto">
        <div className="container mx-auto">
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="upload">Last opp fil</TabsTrigger>
            <TabsTrigger value="select" className="px-4">Velg fra biblioteket</TabsTrigger>
          </TabsList>

          {/* --------------------------- SELECT EXISTING --------------------------- */}
          <TabsContent value="select" className="flex-1 overflow-auto">
            <div
              className={cn(
                "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3",
                "p-1 overflow-y-auto rounded-md",
              )}
            >
              {files.length === 0 && !isFetching && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-6">
                  No uploaded files yet
                </p>
              )}

              {files.map((file) => {
                const url = `/api/v1/files?fid=${file.id}`;
                const isVideo =
                  mime.lookup(file.name)?.toString().startsWith("video");

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => {
                      if (!isSingle) {
                        toast.info("Multi-select not implemented yet");
                        return;
                      }

                      setPreview(url);
                      onUpload?.([
                        {
                          id: file.id,
                          url,
                          type: isVideo ? "video" : "image",
                          name: file.name ?? "File",
                        },
                      ]);

                      if (entityType === "project" && entityId) {
                        changeProjectImage.mutate({
                          projectId: entityId,
                          fileId: file.id,
                        });
                      }

                      setOpen(false);
                    }}
                    className="relative aspect-square rounded-md overflow-hidden border transition hover:ring-2 hover:ring-indigo-300"
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={url}
                        alt={file.name ?? "Image"}
                        width={160}
                        height={160}
                        sizes="(max-width: 320px) 50vw, 25vw"
                        className="object-contain w-full h-full"
                      />
                    )}
                  </button>
                );
              })}

              {data?.nextCursor && (
                <div ref={loadMoreRef} className="col-span-full py-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Loading more…
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ------------------------------- UPLOAD -------------------------------- */}
          <TabsContent value="upload">
            <div className="flex flex-col items-center gap-4">
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
                  
                  utils.files.invalidate()
                }}
              />

              {isSingle && preview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => {
                    if (entityType === "project" && entityId) {
                      changeProjectImage.mutate({
                        projectId: entityId,
                        fileId: null,
                      });
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

        <DialogFooter className="pt-3 mt-auto">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>    
        </div>
      </DialogContent>
    </Dialog>
  );
}
