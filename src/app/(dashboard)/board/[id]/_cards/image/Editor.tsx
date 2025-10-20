"use client";

import { formatFileSize, cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { File } from "@prisma/client";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TextCardEditor({
  card,
  onSave,
  closeEditor=()=>{}
}: {
  card: any;
  onSave: (updates: any) => void;
  closeEditor?: () => void;
}) {
  const [title, setTitle] = useState(card.title || "");
  const [content, setContent] = useState(card.content || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(
    card.file || null
  );

  useEffect(() => {
    if (!selectedFile) return;
    const url = `/api/v1/files?fid=${selectedFile.id}`;
    setContent(url);
    onSave({ title, content: url, fileId: selectedFile?.id });
  }, [selectedFile]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <FileSelectionDialog
        selected={selectedFile}
        onSelect={(f) => setSelectedFile(f)}
        closeEditor={closeEditor}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Dialog (auto-opened on mount)                       */
/* -------------------------------------------------------------------------- */

function FileSelectionDialog({
  selected,
  onSelect,
  closeEditor
}: {
  selected: File | null;
  onSelect: (file: File | null) => void;
  closeEditor?: () => void
}) {
  const [open, setOpen] = useState(true); // 👈 Open instantly when editor mounts

  // If a file is already selected, close the dialog automatically
  useEffect(() => {
    if (selected) setOpen(false);
  }, [selected]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onCloseAutoFocus={()=>closeEditor} className="max-w-4xl p-0 overflow-hidden bg-white/90 backdrop-blur-xl border border-neutral-200">
        <DialogHeader className="p-4 border-b border-neutral-200">
          <DialogTitle className="text-lg font-semibold">
            {selected ? "Change Image" : "Select an Image"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <FileSelection
            selected={selected}
            onSelect={(f) => {
              onSelect(f);
              setOpen(false);
            }}
          />
        </div>

        {selected && (
          <DialogFooter className="p-4 border-t border-neutral-200 flex justify-end">
            <Button variant="ghost" onClick={() => onSelect(null)}>
              Remove
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                               File Selection                               */
/* -------------------------------------------------------------------------- */

function FileSelection({
  selected,
  onSelect,
}: {
  selected: File | null;
  onSelect: (file: File | null) => void;
}) {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"upload" | "library">("library");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const perPage = 12;

  const { data, isLoading } = api.files.list.useQuery({
    page,
    per_page: perPage,
  });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const { items = [], total_pages = 1 } = data ?? {};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/v1/files", { method: "POST", body: formData });
    const uploaded = await res.json();

    if (uploaded?.id) onSelect(uploaded);
  };

  return (
    <div className="flex flex-col gap-3 bg-white/70 rounded-xl border border-neutral-200 p-3 shadow-sm">
      {/* Mode Switch */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-1 justify-center text-sm",
            mode === "upload"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-neutral-100 hover:bg-neutral-200"
          )}
        >
          <Upload size={14} /> Upload
        </Button>
        <Button
          onClick={() => setMode("library")}
          className={cn(
            "flex items-center gap-1 justify-center text-sm",
            mode === "library"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-neutral-100 hover:bg-neutral-200"
          )}
        >
          <ImageIcon size={14} /> Library
        </Button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploadPreview ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image
                src={uploadPreview}
                fill
                alt="Preview"
                className="object-cover rounded-md"
              />
            </div>
          ) : (
            <>
              <Upload size={32} className="text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600">
                Drag & drop or click to upload an image
              </p>
            </>
          )}
          <label
            htmlFor="file-upload"
            className="mt-3 cursor-pointer px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
          >
            Choose File
          </label>
        </div>
      )}

      {/* Library Mode */}
      {mode === "library" && (
        <>
          <div
            ref={listRef}
            className="overflow-y-auto thin-scrollbar grid grid-cols-3 gap-2 rounded-lg"
            style={{ maxHeight: "280px" }}
          >
            {isLoading && (
              <div className="col-span-full flex items-center justify-center text-neutral-500 text-sm py-8">
                Loading files...
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-neutral-500 text-sm py-8">
                No files found.
              </div>
            )}

            {items.map((f: File & any) => {
              const isSelected = selected?.id === f.id;
              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  onClick={() => onSelect(isSelected ? null : f)}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-transparent hover:border-blue-200"
                  )}
                >
                  <Image
                    src={`/api/v1/files?fid=${f.id}`}
                    fill
                    alt="File preview"
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 text-[10px] text-white/90 bg-gradient-to-t from-black/50 to-transparent p-1 px-2 truncate">
                    {f.name || "Unnamed"} • {formatFileSize(f?.size || 0)}
                  </div>
                  {isSelected && (
                    <motion.div
                      layoutId="selected-overlay"
                      className="absolute inset-0 bg-blue-500/30"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center text-sm text-neutral-600 mt-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </Button>

            <span className="text-neutral-500">
              Page {page} / {total_pages}
            </span>

            <Button
              size="sm"
              variant="secondary"
              disabled={page >= total_pages}
              onClick={() => setPage((p) => Math.min(p + 1, total_pages))}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
