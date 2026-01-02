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

interface EditContainerDialogProps {
  container: MediaContainer
  children?: ReactNode;
}

export function EditContainerDialog({ container, children }: EditContainerDialogProps) {
  const color = (container?.color as ThemeColor)
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(container.title);
  const [slug, setSlug] = useState(container.slug)
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
      color: colors,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Rediger</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger Medie</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Tittel */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Tittel</Label>
            <Input
              value={title}
              onChange={(e) => {setTitle(e.target.value); setSlug(slugify(e.target.value))}}
              required
            />
          </div>

          {/* Nettlenke */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Nettlenke</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
          </div>

          <Collapsible>
            <div className="flex items-center gap-2">

              <CollapsibleTrigger className="bg-neutral-100 data-[state=open]:rounded-b-none hover:bg-neutral-200 rounded-md px-4 py-1">Vis fargeinnstillinger</CollapsibleTrigger>
              <div className="ml-auto grid grid-cols-4 gap-2">{Object.entries(colors).map(([key, value]) => (
                  <div className="size-6 rounded-full" style={{ backgroundColor: value }} />
              ))}</div>
            </div>
            <CollapsibleContent className="border-2 p-3 border-neutral-100 rounded-r-md rounded-bl-md">
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
  );
}
