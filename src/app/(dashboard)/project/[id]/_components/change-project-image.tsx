"use client";

import { useState, type ReactNode } from "react";
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
import FilePickerDialog from "@/app/_components/files/file-picker";

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
  return (
    <FilePickerDialog
      entityType="project"
      entityId={projectId}
      maxFiles={1}
      type="image"
      accept=".png,.jpeg,.jpg,.webp"
      title="Change Project Image"
    >
      <Button className="absolute left-4 top-4" variant="outline">Change image</Button>
    </FilePickerDialog>

  )
}
