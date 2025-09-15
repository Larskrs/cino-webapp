"use client";

import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { getEnclosingLineNode, getAllLinesByType } from "../utils";
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { cn } from "@/lib/utils";
import { LineNode } from "../LineNode";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";


export function CharacterQuickSwitch() {
  const [editor] = useLexicalComposerContext();
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentLineType, setCurrentLineType] = React.useState<string | null>(null);
  const [characters, setCharacters] = React.useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

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

        // dropdown position
        setPosition({
          top: rect.top - containerRect.top + editorRoot.scrollTop + fontSize,
          left: rect.left - containerRect.left + editorRoot.scrollLeft,
        });

        setCurrentLineType(lineNode.getLineType());

        // autocomplete logic (characters)
        if (lineNode.getLineType() === "character") {
          const typedPrefix = lineNode.getTextContent().trim().toUpperCase();
          const lines = getAllLinesByType(editor, "character");
          const uniqueChars = Array.from(
            new Map(
              lines
                .map((ln: LineNode) => ln.getTextContent().trim())
                .filter((txt) => txt.length > 0)
                .filter((txt) => txt.toUpperCase().startsWith(typedPrefix))
                .filter((txt) => txt.toUpperCase() !== typedPrefix)
                .map((txt) => [txt.toUpperCase(), txt])
            ).values()
          );
          setCharacters(uniqueChars);
          setHighlightedIndex(-1);
        } else {
          setCharacters([]);
        }
      });
    });
  }, [editor]);

  // keyboard nav
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!characters.length || !position) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev === -1 ? 0 : (prev + 1) % characters.length));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev === -1 ? characters.length - 1 : (prev - 1 + characters.length) % characters.length));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [characters, highlightedIndex, position, editor]);

  // enter key autocomplete
  React.useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (highlightedIndex >= 0 && characters[highlightedIndex]) {
          event?.preventDefault();
          const char = characters[highlightedIndex];
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const node = selection.anchor.getNode();
              const lineNode = getEnclosingLineNode(node);
              if (lineNode) {
                lineNode.setTextContent(char.toUpperCase());
                const newLine = LineNode.create("dialogue");
                lineNode.insertAfter(newLine);
                if (newLine.getChildrenSize() === 0) {
                  newLine.append($createTextNode(""));
                }
                newLine.selectStart();
              }
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, highlightedIndex, characters]);

  const { colors } = useTheme()

    return (
    <>
      {/* character autocomplete dropdown */}
      {position && currentLineType === "character" && (
        <div
          ref={containerRef}
          className={cn(
            "absolute z-50 left-1/2 -translate-x-1/2 bg-transparent rounded-md shadow-lg flex flex-col gap-1"
          )}
          style={{ top: position.top + 64 }}
        >
          {characters.map((char, idx) => (
            <button
              key={char}
              className={cn(
                "px-4 py-1 rounded text-[0.9em] uppercase text-center",
                "cursor-pointer border border-neutral-500/25",
                idx === highlightedIndex
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-950/50 hover:bg-neutral-900"
              )}
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    const node = selection.anchor.getNode();
                    const lineNode = getEnclosingLineNode(node);
                    if (lineNode) {
                      lineNode.setTextContent(char.toUpperCase());
                    }
                  }
                });
              }}
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </>
  );
}