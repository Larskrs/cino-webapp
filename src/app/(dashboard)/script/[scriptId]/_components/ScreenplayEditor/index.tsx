"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useEditor } from "./hook";
import { EditorToolbar } from "./toolbar";
import { SceneSidebar } from "./sidebar";
import { LineEditor } from "./line-editor";
import { type Line, type Scene } from "./types";
import { getScenesFromLines } from "./utils";   
import { Button } from "@/components/ui/button";

const BASE_PAGE_WIDTH = 794;
const A4_RATIO = 210 / 297;
const BASE_FONT_SIZE = 18;
const BASE_LINE_HEIGHT = 1.5;
const BASE_PAGE_PADDING = 128;

export default function ScreenplayEditor({ scriptId }: { scriptId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const {
    lines,
    setLines,
    currentLineType,
    setCurrentLineType,
    focusedLineId,
    setFocusedLineId,
    lineRefs,
    updateLineContent,
    changeLineType,
    insertLineAfter,
    removeLine
  } = useEditor();

  const [pageWidth, setPageWidth] = useState(BASE_PAGE_WIDTH);
  const [pageHeight, setPageHeight] = useState(BASE_PAGE_WIDTH / A4_RATIO);
  const [fontSize, setFontSize] = useState(BASE_FONT_SIZE);
  const [lineHeight, setLineHeight] = useState(BASE_LINE_HEIGHT);
  const [pagePadding, setPagePadding] = useState(BASE_PAGE_PADDING);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Load demo data
  useEffect(() => {
    const demoData: Line[] = [
      { id: "1", type: "scene_header", content: "INT. LIVING ROOM - DAY" },
      { id: "2", type: "action", content: "John sits quietly, staring out the window." }
    ];
    setLines(demoData);
  }, [setLines]);

  // Handle resize
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth * 0.9;
      const width = Math.min(availableWidth, BASE_PAGE_WIDTH);
      const height = width / A4_RATIO;
      const scale = width / BASE_PAGE_WIDTH;
      setPageWidth(width);
      setPageHeight(height);
      setFontSize(BASE_FONT_SIZE * scale);
      setLineHeight(BASE_LINE_HEIGHT * scale);
      setPagePadding(BASE_PAGE_PADDING * scale);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Split lines into pages
  const getPages = useCallback(() => {
    const pages: Line[][] = [];
    let currentPage: Line[] = [];
    let currentHeight = 0;
    lines.forEach((line) => {
      currentHeight += fontSize * lineHeight;
      if (currentHeight > pageHeight - pagePadding * 2) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = fontSize * lineHeight;
      }
      currentPage.push(line);
    });
    if (currentPage.length) pages.push(currentPage);
    return pages;
  }, [lines, fontSize, lineHeight, pageHeight, pagePadding]);

  // Focus helpers
  const focusLine = (id: string, toEnd = true) => {
    const el = lineRefs.current.get(id);
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(toEnd);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
  };

  // Handle key events
const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, line: Line) => {
  const idx = lines.findIndex((l) => l.id === line.id);
  const selection = window.getSelection();
  const anchorOffset = selection?.anchorOffset || 0;
  const lineLength = lineRefs.current.get(line.id)?.innerText.length || 0;

  const isAtStart = anchorOffset === 0;
  const isAtEnd = anchorOffset === lineLength;

  // 🔥 DELETE EMPTY LINE
  if (
    (e.key === "Backspace" && isAtStart && lineLength === 0) ||
    (e.key === "Delete" && lineLength === 0)
  ) {
    e.preventDefault();
    // choose neighbor line to focus
    const nextFocusId =
      idx > 0 ? lines[idx - 1].id : lines[idx + 1]?.id;

    removeLine(line.id);

    if (nextFocusId) {
      setFocusedLineId(nextFocusId);
      requestAnimationFrame(() => focusLine(nextFocusId));
    }
    return;
  }

  // ⬆ UP ARROW
  if (e.key === "ArrowUp" && isAtStart && idx > 0) {
    e.preventDefault();
    const prevLineId = lines[idx - 1].id;
    setFocusedLineId(prevLineId);
    focusLine(prevLineId);
  }

  // ⬇ DOWN ARROW
  if (e.key === "ArrowDown" && idx < lines.length - 1) {
    e.preventDefault();
    const nextLineId = lines[idx + 1].id;
    setFocusedLineId(nextLineId);
    focusLine(nextLineId);
  }

  // ⏎ ENTER
  if (e.key === "Enter") {
    e.preventDefault();
    if (e.shiftKey) {
      const el = lineRefs.current.get(line.id);
      if (!el) return;
      document.execCommand("insertHTML", false, "\n");
    } else {
      const el = lineRefs.current.get(line.id);
      if (el) updateLineContent(line.id, el.innerText);

      const newId = insertLineAfter(line.id, line.type);
      if (newId) {
        setFocusedLineId(newId);
        requestAnimationFrame(() => focusLine(newId));
      }
    }
  }
};


  const scenes: Scene[] = getScenesFromLines(lines);

  return (
    <div className="grid grid-cols-[14em_1fr] w-full bg-gray-900 text-gray-100">
      <SceneSidebar
        scenes={scenes}
        activeSceneId={activeSceneId}
        onSceneClick={(id) => {
          setActiveSceneId(id);
          document.getElementById(`scene-${id}`)?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <div ref={containerRef} className="col-start-2 overflow-y-auto flex justify-center p-8">
        <div className="w-full max-w-[900px]">
          <EditorToolbar
            currentLineType={currentLineType}
            setCurrentLineType={setCurrentLineType}
            onTypeChange={(type) => {
              if (focusedLineId) changeLineType(focusedLineId, type);
            }}
          />
          <PageRenderer
            pages={getPages()}
            pageRefs={pageRefs}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            fontSize={fontSize}
            lineHeight={lineHeight}
            pagePadding={pagePadding}
            focusedLineId={focusedLineId}
            setFocusedLineId={setFocusedLineId}
            updateLineContent={updateLineContent}
            handleKeyDown={handleKeyDown}
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={() => console.log("Save!")}>Save & Create Version</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PageRenderer
function PageRenderer({
  pages,
  pageRefs,
  pageWidth,
  pageHeight,
  fontSize,
  lineHeight,
  pagePadding,
  focusedLineId,
  setFocusedLineId,
  updateLineContent,
  handleKeyDown
}: {
  pages: Line[][];
  pageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  pageWidth: number;
  pageHeight: number;
  fontSize: number;
  lineHeight: number;
  pagePadding: number;
  focusedLineId: string | null;
  setFocusedLineId: (id: string) => void;
  updateLineContent: (id: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, line: Line) => void;
}) {
  let sceneCounter = 0;

  const lineToPage: Record<string, number> = {};
  pages.forEach((page, pageIdx) => {
    page.forEach((line) => {
      lineToPage[line.id] = pageIdx;
    });
  });

  return (
    <div className="flex flex-col items-center gap-32">
      {pages.map((pageLines, pageIdx) => (
        <motion.div
          key={pageIdx}
          ref={(el) => {
            if (el) pageRefs.current.set(`page-${pageIdx}`, el);
          }}
          className="relative shadow-lg font-courier flex flex-col bg-white text-black"
          style={{ width: pageWidth, height: pageHeight, paddingBlock: pagePadding }}
        >
          <span className="absolute bottom-8 right-8" style={{ fontSize }}>
            Page {pageIdx + 1}
          </span>
          {pageLines.map((line) => {
            if (line.type === "scene_header") sceneCounter++;
            return (
              <LineEditor
                key={line.id}
                line={line}
                focused={line.id === focusedLineId}
                refMap={pageRefs as any}
                fontSize={fontSize}
                lineHeight={lineHeight}
                padding={pagePadding}
                sceneNumber={line.type === "scene_header" ? sceneCounter : undefined}
                onFocus={() => setFocusedLineId(line.id)}
                onInput={(value) => updateLineContent(line.id, value)}
                onKeyDown={(e) => handleKeyDown(e, line)}
              />
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}
