"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LineEditor } from "./line-editor";
import { type Line } from "./types";

const PAGE_HEIGHT = 1122; // A4 at 96dpi ~ 297mm
const PAGE_WIDTH = 794;
const PAGE_PADDING = 128;

export function VirtualizedPages({
  lines,
  focusedLineId,
  setFocusedLineId,
  updateLineContent,
  handleKeyDown,
  fontSize,
  lineHeight,
}: {
  lines: Line[];
  focusedLineId: string | null;
  setFocusedLineId: (id: string) => void;
  updateLineContent: (id: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, line: Line) => void;
  fontSize: number;
  lineHeight: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const refMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Split lines into pages based on height
  const pages = useMemo(() => {
    const pages: Line[][] = [];
    let currentPage: Line[] = [];
    let currentHeight = 0;

    const lineHeightPx = fontSize * lineHeight;

    for (const line of lines) {
      currentHeight += lineHeightPx;
      if (currentHeight > PAGE_HEIGHT - PAGE_PADDING * 2) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = lineHeightPx;
      }
      currentPage.push(line);
    }
    if (currentPage.length) pages.push(currentPage);
    return pages;
  }, [lines, fontSize, lineHeight]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => PAGE_HEIGHT + 32, // add gap
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto w-full flex justify-center"
      style={{ height: "100%", padding: "16px" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: PAGE_WIDTH,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const pageLines = pages[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBlock: PAGE_PADDING,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "white",
                marginBottom: 32,
                color: "black"
              }}
            >
              {pageLines?.map((line) => (
                <LineEditor
                  key={line.id}
                  line={line}
                  focused={focusedLineId === line.id}
                  refMap={refMap}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  padding={PAGE_PADDING}
                  onFocus={() => setFocusedLineId(line.id)}
                  onInput={(value) => updateLineContent(line.id, value)}
                  onKeyDown={(e) => handleKeyDown(e, line)}
                />
              ))}
              <span
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  fontSize: fontSize * 0.8,
                  color: "#555",
                }}
              >
                Page {virtualRow.index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
