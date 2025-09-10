"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { getScenesWithIndex } from "../utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { LineNode } from "../LineNode";
import { House, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";

export function SceneSearchPlugin() {
  const [editor] = useLexicalComposerContext();
  const [scenes, setScenes] = useState<{ index: number; text: string; node: LineNode }[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { colors } = useTheme();

  // Fetch scenes from editor
  useEffect(() => {
    const updateScenes = () => {
      editor.update(() => {
        setScenes(getScenesWithIndex(editor));
      });
    };
    updateScenes();

    const unregister = editor.registerUpdateListener(() => {
      updateScenes();
    });
    return () => unregister();
  }, [editor]);

  // Handle Ctrl + S to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input automatically when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery(""); // reset search when opening
    }
  }, [open]);

  // Filtered scenes
  const filteredScenes = scenes.filter((scene) =>
    scene.text.toLowerCase().includes(query.toLowerCase())
  );

  // Handle number key navigation when dialog is open
  useEffect(() => {
    if (!open) return;

    const handleNumberKey = (e: KeyboardEvent) => {
      //if (e.ctrlKey || e.altKey || e.metaKey) return; // ignore modifier combos
      const n = parseInt(e.key);
      if (isNaN(n)) return;
      const scene = scenes.find((s) => s.index === n);
      if (scene) {
        e.preventDefault();
        editor.update(() => {
          scene.node.select();
          setOpen(false);
        });
      }
    };

    document.addEventListener("keydown", handleNumberKey);
    return () => document.removeEventListener("keydown", handleNumberKey);
  }, [open, scenes, editor]);

  const goToScene = (scene: LineNode) => {
    editor.update(() => {
      scene.select();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden">Search Scenes</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scenes</DialogTitle>
        </DialogHeader>

        <Input
          ref={inputRef}
          type="text"
          placeholder="Search scenes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "w-full mb-0 rounded-xl border px-3 py-2 outline-none",
            colors.cardBackground,
            colors.text
          )}
        />

        <ul className="space-y-2 mt-2">
          {filteredScenes.length === 0 && <li className="text-neutral-500">No scenes found</li>}
          {filteredScenes.map((scene) => {
            const isInterior = /^INT\./i.test(scene.text);
            const isExterior = /^EXT\./i.test(scene.text);

            const displayText = scene.text.replace(/^INT\. |^EXT\. /i, "");
            const Icon = isInterior ? House : isExterior ? Trees : null;

            return (
              <li key={scene.index}>
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer justify-start text-left"
                  onClick={() => goToScene(scene.node)}
                >
                  <span className="flex items-center justify-center bg-gray-700/50 size-6 rounded-full text-white text-center">
                    {scene.index}
                  </span>
                  {Icon && <Icon className={cn("ml-2 mr-1 size-6", colors.textMuted)} />}
                  <span className="text-md">{displayText}</span>
                </Button>
              </li>
            );
          })}
        </ul>

        <DialogClose asChild>
          <Button variant="secondary" className="mt-4 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
