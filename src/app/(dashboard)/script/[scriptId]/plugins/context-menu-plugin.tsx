"use client";

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LINE_TYPES, type LineTypeKey } from "../lineTypes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LineNode } from "../LineNode";
import { $getSelection, $isRangeSelection } from "lexical";
import { getEnclosingLineNode, setLineTypeSafely } from "../utils";

type LineTypeDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: LineTypeKey) => void;
  anchorPoint: { x: number; y: number } | null;
};

export function LineTypeDropdown({ open, onOpenChange, onSelect, anchorPoint }: LineTypeDropdownProps) {
  if (!anchorPoint) return null;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      {/* Hidden trigger just to satisfy Radix */}
      <DropdownMenuTrigger asChild>
        <div />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        forceMount
        side="right"
        align="start"
        style={{ position: "fixed", left: anchorPoint.x, top: anchorPoint.y }}
        className="max-h-64 z-1000 overflow-y-auto"
      >
        {Object.entries(LINE_TYPES).map(([key, data]) => {
          const typeKey = key as LineTypeKey;
          const Icon = data.icon;
          return (
            <DropdownMenuItem key={typeKey} onSelect={() => onSelect(typeKey)}>
              <Icon size={14} className="mr-2" />
              {data.displayName}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LineContextMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = React.useState(false);
  const [anchorPoint, setAnchorPoint] = React.useState<{x:number, y:number} | null>(null);
  const currentLineRef = React.useRef<LineNode | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();

      editor.update(() => {
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;
        const node = editor.getElementByKey(domSelection.anchorNode?.parentElement?.getAttribute("data-lexical-node-key") || "");
        // You already have getEnclosingLineNode helper
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const lineNode = getEnclosingLineNode(selection.anchor.getNode());
          if (lineNode) {
            currentLineRef.current = lineNode;
            setAnchorPoint({ x: e.clientX, y: e.clientY });
            setOpen(true);
          }
        }
      });
    };

    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [editor]);

  const handleSelect = React.useCallback(
    (type: LineTypeKey) => {
      if (!currentLineRef.current) return;
      editor.update(() => {
        setLineTypeSafely(editor, currentLineRef.current!, type);
      });
      setOpen(false);
    },
    [editor]
  );

  return (
    <LineTypeDropdown
      open={open}
      onOpenChange={setOpen}
      onSelect={handleSelect}
      anchorPoint={anchorPoint}
    />
  );
}
