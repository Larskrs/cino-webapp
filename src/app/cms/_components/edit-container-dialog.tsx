"use client";

import { useState, type ReactNode, useEffect } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn, slugify } from "@/lib/utils";
import { OklchThemeEditor } from "./oklch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type MediaContainer } from "@prisma/client";
import type { ThemeColor } from "@/app/_components/theme-injection";
import FilePickerDialog from "@/app/_components/files/file-picker";
import ThemeInjection from "@/app/_components/theme-injection";

interface EditContainerDialogProps {
  container: MediaContainer
  children?: ReactNode;
}

export function EditContainerDialog({ container, children }: EditContainerDialogProps) {
  const color = (container?.color as ThemeColor)
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(container.title);
  const [slug, setSlug] = useState(container.slug)

  const [showFilePicker, setShowFilePicker] = useState<"thumbnail" | "logo" | "poster" | null>(null);
  const [thumbnail, setThumbnail] = useState(container.thumbnail ?? "");
  const [logo, setLogo] = useState(container.logo ?? "");
  const [poster, setPoster] = useState(container.poster ?? "");
  
  const [hue, setHue] = useState(250); // Default hue
  const [colors, setColors] = useState({
    background: color?.background ?? "",
    primary: color?.primary ?? "",
    secondary: color?.secondary ?? "",
    text: color?.text ?? "",
  });

  const utils = api.useContext();
  const updateContainer = api.media.update_container.useMutation({
    onSuccess: () => {
      utils.media.get_container.invalidate({ id: container.id });
      setOpen(false);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateContainer.mutate({
      id: container.id,
      title,
      slug,
      thumbnail,
      logo,
      poster,
      color: colors,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children ?? <Button variant="opposite">Rediger</Button>}
        </DialogTrigger>
        <DialogContent className="max-h-[90dvh] container overflow-y-auto border-0">
          <DialogHeader>
            <DialogTitle className="text-primary">Rediger Medie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Tittel */}
            <div>
              <Label className="text-text/75 mb-1 block text-sm font-medium">Tittel</Label>
              <Input
                value={title}
                onChange={(e) => {setTitle(e.target.value); setSlug(slugify(e.target.value))}}
                className="text-text/75 border-border/75 focus-visible:ring-0 focus-visible:border-primary/75"  
                required
              />
            </div>

            {/* Nettlenke */}
            <div>
              <Label className="text-text/75 mb-1 block text-sm font-medium">Nettlenke</Label>
              <Input
                className="text-text/75 border-border/75 focus-visible:ring-0 focus-visible:border-primary/50"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
              />
            </div>

            <div>
              <Label className="text-text/75 block text-sm font-medium mb-1">Videobilde</Label>
              <div className="flex gap-2">
                <Input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="text-text/75 border-border/75 focus-visible:ring-0 focus-visible:border-primary/75"  
                />
                <Button type="button" variant="opposite" onClick={() => {
                  setOpen(false);
                  setShowFilePicker("thumbnail");
                }}>
                  Velg
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-text/75 block text-sm font-medium mb-1">Logo</Label>
              <div className="flex gap-2">
                <Input
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="text-text/75 border-border/75 focus-visible:ring-0 focus-visible:border-primary/75"  
                />
                <Button type="button" variant="opposite" onClick={() => {
                  setOpen(false);
                  setShowFilePicker("logo");
                }}>
                  Velg
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-text/75 block text-sm font-medium mb-1">Plakat</Label>
              <div className="flex gap-2">
                <Input
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                  className="text-text/75 border-border/75 focus-visible:ring-0 focus-visible:border-primary/75"  
                />
                <Button type="button" variant="opposite" onClick={() => {
                  setOpen(false);
                  setShowFilePicker("poster");
                }}>
                  Velg
                </Button>
              </div>
            </div>

            <Collapsible>
              <div className="flex items-center gap-2">

                <CollapsibleTrigger className="bg-secondary data-[state=open]:rounded-b-none hover:bg-primary/50 rounded-md px-4 py-1">Vis fargeinnstillinger</CollapsibleTrigger>
                <div className="ml-auto grid grid-cols-4 gap-2">{Object.entries(colors).map(([key, value]) => (
                    <div className="size-6 rounded-full" style={{ backgroundColor: value }} />
                ))}</div>
              </div>
              <CollapsibleContent className="border-2 p-3 border-secondary rounded-r-md rounded-bl-md">
                <OklchThemeEditor
                  value={colors}
                  onChange={setColors}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Error */}
            {updateContainer.error && (
              <p className="text-sm text-red-600">{updateContainer.error.message}</p>
            )}

            <Button type="submit" disabled={updateContainer.isPending} className="w-full">
              {updateContainer.isPending ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <FilePickerDialog
        title={showFilePicker ?? "ukjent problem"}
        key={showFilePicker}
        openDefault={showFilePicker != null}
        type={showFilePicker == "thumbnail" ? "image" : "video"}
        onUpload={(files) => {
          const url = files[0]?.url;
          if (!url) return;
          if (showFilePicker === "thumbnail") setThumbnail(url);
          if (showFilePicker === "logo") setLogo(url);
          if (showFilePicker === "poster") setPoster(url);
          setShowFilePicker(null);
          setTimeout(() => setOpen(true), 100); // delay reopen to allow dialog unmount
        }}
        onClose={() => {
          setShowFilePicker(null);
          setTimeout(() => setOpen(true), 100);
        }}
      />
    </>
  );
}
