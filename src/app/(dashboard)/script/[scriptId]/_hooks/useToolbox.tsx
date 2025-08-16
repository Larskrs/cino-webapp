import React, { useState, useRef } from "react";
import { type Line, type LineTypeKey } from "../lineTypes";

type UseEditorToolboxReturn = {
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  currentLineType: LineTypeKey;
  setCurrentLineType: (type: LineTypeKey) => void;
  focusedLineId: string | null;
  setFocusedLineId: React.Dispatch<React.SetStateAction<string | null>>;
  lineRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
};

export function useEditorToolbox(initialLines: Line[] = [{ id: "line-0", type: "scene_header", content: "" }]): UseEditorToolboxReturn {
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [currentLineType, setCurrentLineType] = useState<LineTypeKey>("scene_header");

  // make sure TypeScript knows this can be null
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  return {
    lines,
    setLines,
    currentLineType,
    setCurrentLineType,
    focusedLineId,
    setFocusedLineId,
    lineRefs,
  };
}

const EditorToolboxContext = React.createContext<ReturnType<typeof useEditorToolbox> | null>(null);

export function EditorToolboxProvider({ children }: { children: React.ReactNode }) {
  const toolbox = useEditorToolbox();
  return (
    <EditorToolboxContext.Provider value={toolbox}>
      {children}
    </EditorToolboxContext.Provider>
  );
}

export function useEditorToolboxContext() {
  const ctx = React.useContext(EditorToolboxContext);
  if (!ctx) throw new Error("useEditorToolboxContext must be used inside EditorToolboxProvider");
  return ctx;
}
