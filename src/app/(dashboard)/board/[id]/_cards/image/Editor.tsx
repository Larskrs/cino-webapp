"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FilePickerDialog from "@/app/_components/files/file-picker";
import type { UploadedFile } from "@/app/_components/files/file-upload";

/* -------------------------------------------------------------------------- */
/*                              Image Card Editor                             */
/* -------------------------------------------------------------------------- */

export default function ImageCardEditor({
  card,
  onSave,
  closeEditor = () => {},
}: {
  card: any;
  onSave: (updates: any) => void;
  closeEditor?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [preview, setPreview] = useState<string | null>(
    card.content && card.content.startsWith("http") ? card.content : null
  );

  // Auto-update when a new file is selected or uploaded
  useEffect(() => {
    if (!selectedFile) return;
    const url = `/api/v1/files?fid=${selectedFile.id}`;
    setPreview(url);
    onSave({ title: card.title || "", content: url, fileId: selectedFile.id });
    closeEditor?.();
  }, [selectedFile]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Image Picker */}
      <FileSelectionDialog
        selected={selectedFile}
        closeEditor={closeEditor}
        onSelect={(f) => {
          const url = `/api/v1/files?fid=${f?.id}`;
          setPreview(url);
          onSave({ title: card.title || "", content: url, fileId: f?.id });
          closeEditor?.();
        }}
      />

      {/* Image Preview */}
      {preview ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border border-neutral-300 dark:border-neutral-700">
          <Image
            src={preview}
            alt="Selected image"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-video flex items-center justify-center border border-dashed border-neutral-400/60 rounded-lg text-neutral-500 dark:text-neutral-400">
          No image selected
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             File Selection Dialog                           */
/* -------------------------------------------------------------------------- */

function FileSelectionDialog({
  selected,
  onSelect,
  closeEditor
}: {
  selected: UploadedFile | null;
  onSelect: (file: UploadedFile | null) => void;
  closeEditor?: () => void;
}) {
  const [open, setOpen] = useState(true);

  // Close dialog if already selected
  useEffect(() => {
    if (selected) setOpen(false);
  }, [selected]);

  return (
    <FilePickerDialog
      openDefault={true}
      onClose={() => {closeEditor}}
      maxFiles={1}
      accept=".png,.jpeg,.jpg,.webp"
      type="image"
      title="Select image"
      currentFiles={selected ? [selected.url] : []}
      onUpload={(files: UploadedFile[]) => {
        if (files && files[0]) {
          onSelect(files[0]);
          setOpen(false);
        }
      }}
    >
      
    </FilePickerDialog>
  );
}
