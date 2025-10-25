"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/use-theme";
import Video from "../video";

export interface UploadedFile {
  url: string;
  type: "image" | "video";
  name: string;
}

interface SingleFileUploaderProps {
  accept?: string;
  onUpload?: (file: UploadedFile) => void | Promise<void>;
  onError?: (error: string) => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                             Single File Uploader                           */
/* -------------------------------------------------------------------------- */
export function SingleFileUploader({
  accept = "image/*,video/*",
  onUpload,
  onError,
  className,
}: SingleFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { colors } = useTheme();

  /* ---------------------------------------------------------------------- */
  /*                               File Upload                              */
  /* ---------------------------------------------------------------------- */
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const data = new FormData();
      data.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/v1/files", true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = async () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const json = JSON.parse(xhr.responseText);
          if (json.url) {
            const uploaded: UploadedFile = {
              url: json.url,
              type: file.type.startsWith("video/") ? "video" : "image",
              name: file.name,
            };
            setProgress(100);
            setErrorMsg("");
            onUpload?.(uploaded);
          } else {
            const msg = json.error || "Upload failed";
            setErrorMsg(msg);
            onError?.(msg);
          }
        } else {
          const msg = "Upload failed";
          setErrorMsg(msg);
          onError?.(msg);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        const msg = "Network error during upload";
        setErrorMsg(msg);
        onError?.(msg);
      };

      xhr.send(data);
    } catch (err: any) {
      setUploading(false);
      const msg = err.message || "Unexpected upload error";
      setErrorMsg(msg);
      onError?.(msg);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              File Selection                            */
  /* ---------------------------------------------------------------------- */
  const handleFile = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const f = fileList?.[0];
      if (!f) return
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      uploadFile(f);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile({ 0: file, length: 1, item: () => file } as any);
    },
    [uploading, handleFile]
  );

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setErrorMsg("");
  };

  /* ---------------------------------------------------------------------- */
  /*                                 Render                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all select-none p-6",
        uploading
          ? "border-indigo-400 bg-indigo-50/40"
          : "border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50/40",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden">
          {file?.type.startsWith("video/") ? (
            <Video src={previewUrl} controls className="w-full h-full object-contain" />
          ) : (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          )}

          {!uploading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!previewUrl && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-neutral-600">
          <UploadCloud className="size-10 text-neutral-400" />
          <p className="text-sm font-medium">Dra inn eller klikk for å laste opp</p>
          <p className="text-xs text-neutral-400">Kun ett bilde eller video om gangen</p>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="absolute bottom-0 left-0 right-0">
          <Progress
            value={progress}
            className={cn(
              "h-1",
              colors.components.dialog?.button || "bg-indigo-500"
            )}
          />
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <p className="text-xs text-red-500 mt-2 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
