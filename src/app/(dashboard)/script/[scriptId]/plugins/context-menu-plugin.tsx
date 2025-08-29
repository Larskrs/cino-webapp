"use client";

import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { getEnclosingLineNode, getAllLinesByType } from "../utils"; 
import { cn } from "@/lib/utils";
import type { LineNode } from "../LineNode";

export function LineDropdownPlugin() {
  const [editor] = useLexicalComposerContext();
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentLineType, setCurrentLineType] = React.useState<string | null>(null);
  const [characters, setCharacters] = React.useState<string[]>([]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setPosition(null);
          return;
        }

        const node = selection.anchor.getNode();
        const lineNode = getEnclosingLineNode(node);
        if (!lineNode) {
          setPosition(null);
          return;
        }

        const dom = editor.getElementByKey(lineNode.getKey());
        if (!dom) {
          setPosition(null);
          return;
        }

        const rect = dom.getBoundingClientRect();
        const fontSize = parseFloat(window.getComputedStyle(dom).fontSize);

        const editorRoot = editor.getRootElement();
        if (!editorRoot) return;

        const containerRect = editorRoot.getBoundingClientRect();

        setPosition({
          top: rect.top - containerRect.top + editorRoot.scrollTop + fontSize,
          left: rect.left - containerRect.left + editorRoot.scrollLeft,
        });
        setCurrentLineType(lineNode.getLineType());

        // If this line is a CHARACTER line → collect all characters
        if (lineNode.getLineType() === "character") {
          const lines = getAllLinesByType(editor, "character");
          const uniqueChars = Array.from(
            new Set(
              lines
                .map((ln: LineNode) => ln.getTextContent().trim())
                .filter((txt) => txt.length > 0)
            )
          );
          setCharacters(uniqueChars);
        } else {
          setCharacters([]);
        }
      });
    });
  }, [editor]);

  if (!position || currentLineType !== "character") return null;

  return (
    <div
      className={cn(
        "absolute z-50 left-1/2 -translate-x-1/2 bg-neutral-900/25 rounded-md shadow-lg flex flex-col gap-1"
      )}
      style={{
        top: position.top + 64,
        // left: position.left,
      }}
    >
      {characters.map((char) => (
        <button
          key={char}
          className={cn(
            "px-4 py-1 rounded text-[0.9em] text-center",
            "bg-neutral-800/75 hover:bg-neutral-700"
          )}
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                const lineNode = getEnclosingLineNode(node);
                if (lineNode) {
                  lineNode.setextContent(char);
                }
              }
            });
          }}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
