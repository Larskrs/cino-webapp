"use client";
import React, { useEffect, useRef, useState } from "react";
import { type Line, LINE_TYPES } from "./types";
import { cn } from "@/lib/utils";
import { placeCaretAtEnd } from "./utils";

export const LineEditor = React.memo(function LineEditor({
  line,
  focused,
  refMap, // must be lineRefs from parent
  fontSize,
  lineHeight,
  padding,
  sceneNumber,
  onFocus,
  onInput,
  onKeyDown,
}: {
  line: Line;
  focused: boolean;
  refMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
  fontSize: number;
  lineHeight: number;
  padding: number;
  sceneNumber?: number;
  onFocus: () => void;
  onInput: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  const TypeIcon = LINE_TYPES[line.type].icon;
  const divRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Sync external content
  useEffect(() => {
    if (!divRef.current) return;
    if (divRef.current.innerText !== line.content) {
      divRef.current.innerText = line.content;
    }
  }, [line.content]);

  // Scroll + focus if needed
  useEffect(() => {
    if (focused && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      placeCaretAtEnd(divRef.current);
    }
  }, [focused]);

  // Observe visibility
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      {
        root: null, // viewport
        threshold: 0.1, // only counts as visible if at least 10% of the line is in view
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative font-courier flex flex-row items-center justify-start">
      {/* Type icon */}
      <span
        className={cn(
          "absolute left-8 flex flex-row p-1 text-xl transition-opacity text-gray-400",
          focused ? "opacity-85" : "opacity-0"
        )}
      >
        <TypeIcon size={fontSize} />
      </span>

      {/* Scene numbers */}
      {line.type === "scene_header" && sceneNumber != null && (
        <>
          <span
            className="pointer-events-none absolute left-[10%] select-none text-gray-400"
            style={{ minHeight: fontSize * lineHeight, fontSize, lineHeight }}
          >
            {sceneNumber}
          </span>
          <span
            className="pointer-events-none absolute right-[10%] select-none text-gray-400"
            style={{ minHeight: fontSize * lineHeight, fontSize, lineHeight }}
          >
            {sceneNumber}
          </span>
        </>
      )}

      {/* Editable line */}
      <div
        ref={(el) => {
          divRef.current = el!;
          if (el) refMap.current.set(line.id, el);
          else refMap.current.delete(line.id);
        }}
        contentEditable={isVisible}
        suppressContentEditableWarning
        className={cn(
          "outline-none font-courier w-full break-words relative",
          focused && "outline-2 outline-blue-500",
          line.type === "scene_header"
            ? "uppercase text-start mr-auto font-black px-4"
            : line.type === "character"
            ? "text-center uppercase font-bold"
            : line.type === "dialog"
            ? "text-center italic mr-[15%] ml-[5%]"
            : ""
        )}
        style={{
          minHeight: fontSize * lineHeight,
          fontSize,
          lineHeight,
          paddingInline: padding,
        }}
        onFocus={onFocus}
        onBlur={() => onInput(divRef.current?.innerText ?? "")}
        onInput={(e) => onInput((e.target as HTMLDivElement).innerText)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
});
