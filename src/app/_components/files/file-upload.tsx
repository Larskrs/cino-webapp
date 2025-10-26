"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/use-theme";
import Video from "../video";

export interface UploadedFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface MultiFileUploaderProps {
  accept?: string;
  onUpload?: (files: UploadedFile[]) => void | Promise<void>;
  onError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

export function MultiFileUploader({
  accept = "image/*,video/*",
  onUpload,
  onError,
  maxFiles = 10,
  className,
}: MultiFileUploaderProps) {
  const [uploads, setUploads] = useState<
    {
      file: File;
      preview: string;
      progress: number;
      uploaded?: UploadedFile;
      error?: string;
    }[]
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { colors } = useTheme();

  /* ------------------------------- UPLOAD ------------------------------- */
  const uploadFile = (file: File, index: number) => {
    const data = new FormData();
    data.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/files", true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index ? { ...u, progress: percent } : u
          )
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.url && json.data?.id) {
            const uploaded: UploadedFile = {
              id: json.data.id,
              url: json.url,
              type: file.type.startsWith("video/") ? "video" : "image",
              name: file.name,
            };
            setUploads((prev) =>
              prev.map((u, i) =>
                i === index ? { ...u, uploaded, progress: 100 } : u
              )
            );
            onUpload?.(
              prevUploadedFiles([...uploads, { file, uploaded }])
            );
          } else throw new Error("Invalid server response");
        } catch (err: any) {
          const msg = err.message || "Upload failed";
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, error: msg } : u
            )
          );
          onError?.(msg);
        }
      } else {
        const msg = "Upload failed";
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index ? { ...u, error: msg } : u
          )
        );
        onError?.(msg);
      }
    };

    xhr.onerror = () => {
      const msg = "Network error";
      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, error: msg } : u
        )
      );
      onError?.(msg);
    };

    xhr.send(data);
  };

  const prevUploadedFiles = (list: any[]) =>
    list
      .map((u) => u.uploaded)
      .filter(Boolean) as UploadedFile[];

  /* ----------------------------- FILE HANDLERS ----------------------------- */
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).slice(0, maxFiles - uploads.length);
      if (files.length === 0) return;

      const newUploads = files.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...newUploads]);
      newUploads.forEach((u, i) =>
        uploadFile(u.file, uploads.length + i)
      );
    },
    [uploads, maxFiles]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploads((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      onUpload?.(prevUploadedFiles(newList));
      return newList;
    });
  };

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col gap-4 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none p-6 max-w-full w-full",
        "border-neutral-300 bg-neutral-50/40 hover:border-indigo-400 hover:bg-neutral-100/40 dark:border-neutral-700 dark:bg-neutral-900/40 dark:hover:border-indigo-500 dark:hover:bg-neutral-800/60",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Empty State */}
      {uploads.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-neutral-600 dark:text-neutral-300">
          <UploadCloud className="size-10 text-neutral-400 dark:text-neutral-500" />
          <p className="text-sm font-medium">
            Dra inn eller klikk for å laste opp filer
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Opptil {maxFiles} filer om gangen
          </p>
        </div>
      )}

      {/* File Grid */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {uploads.map((u, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800"
            >
              {u.file.type.startsWith("video/") ? (
                <Video src={u.preview} className="w-full h-full object-contain" />
              ) : (
                <img
                  src={u.preview}
                  alt={u.file.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Progress */}
              {u.progress > 0 && u.progress < 100 && (
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress
                    value={u.progress}
                    className={cn("h-1", colors.components.dialog?.button || "bg-indigo-500")}
                  />
                </div>
              )}

              {/* Remove */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="absolute top-1 right-1 bg-black/60 dark:bg-white/20 hover:bg-black/80 dark:hover:bg-white/30 rounded-full p-1 text-white dark:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Error */}
              {u.error && (
                <p className="absolute bottom-2 left-0 right-0 text-xs text-red-500 dark:text-red-400 text-center">
                  {u.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
