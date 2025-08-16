"use client";
import { useState, useRef, useCallback } from "react";
import { type Line, type LineTypeKey } from "./types";

export function useEditor(initialLines: Line[] = []) {
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [currentLineType, setCurrentLineType] = useState<LineTypeKey>("action");
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const updateLineContent = useCallback((id: string, content: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, content } : l)));
  }, []);

  const changeLineType = useCallback((id: string, type: LineTypeKey) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, type } : l)));
  }, []);

  const insertLineAfter = useCallback((id: string, type: LineTypeKey) => {
    const idx = lines.findIndex(l => l.id === id);
    if (idx === -1) return;
    const newLine: Line = { id: `line-${Date.now()}`, type, content: "" };
    const updated = [...lines];
    updated.splice(idx + 1, 0, newLine);
    setLines(updated);
    return newLine.id;
  }, [lines]);

  const removeLine = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  return {
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
  };
}
