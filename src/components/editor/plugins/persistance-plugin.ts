"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  ParagraphNode,
  type EditorState,
  type LexicalEditor,
} from "lexical";
import { LineNode } from "../LineNode";
import type { LineTypeKey } from "../lineTypes";

/** JSON schema */
export type ScreenplayLine = {
  type: LineTypeKey;
  content: string;
};
export type ScreenplayDoc = {
  version: 1;
  lines: ScreenplayLine[];
};

export type ScreenplayPersistencePluginProps = {
  storageKey?: string;
  initialDoc?: ScreenplayDoc;
  onDocChange?: (doc: ScreenplayDoc) => void;
  debounceMs?: number;
  enforceLineNodeTransform?: boolean;
};

/* ---------------- Utils ---------------- */

function readDocFromEditorState(editorState: EditorState): ScreenplayDoc {
  return editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    const lines: ScreenplayLine[] = children.map((child) => {
      if (child instanceof LineNode) {
        return {
          type: child.getLineType(),
          content: child.getTextContent(),
        };
      }
      return {
        type: "action" as LineTypeKey,
        content: (child as any).getTextContent?.() ?? "",
      };
    });
    return { version: 1 as const, lines };
  });
}

function writeDocToEditor(editor: LexicalEditor, doc: ScreenplayDoc) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();

    doc.lines.forEach((l) => {
      const node = LineNode.create(l.type);
      node.setTextContent(l.content);
      root.append(node);
    });
  });
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, ms);
  } as T;
}

/* ---------------- Plugin ---------------- */

export default function ScreenplayPersistencePlugin({
  storageKey,
  initialDoc,
  onDocChange,
  debounceMs = 300,
  enforceLineNodeTransform = true,
}: ScreenplayPersistencePluginProps) {
  const [editor] = useLexicalComposerContext();
  const skRef = useRef(storageKey);

  // Node transform: convert ParagraphNode → LineNode
  useEffect(() => {
    if (!enforceLineNodeTransform) return;
    return editor.registerNodeTransform(ParagraphNode, (node) => {
      if (!(node instanceof LineNode)) {
        const ln = LineNode.create("action");
        ln.append(...node.getChildren());
        node.replace(ln);
      }
    });
  }, [editor, enforceLineNodeTransform]);

  // Initial load
  useEffect(() => {
    const doc: ScreenplayDoc | null =
      initialDoc ??
      (() => {
        if (!storageKey) return null;
        try {
          const raw = localStorage.getItem(storageKey);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (parsed?.version === 1 && Array.isArray(parsed.lines)) {
            return parsed as ScreenplayDoc;
          }
        } catch {
          return null;
        }
        return null;
      })();

    if (doc) writeDocToEditor(editor, doc);
  }, [editor, initialDoc, storageKey]);

  // Debounced save + notify
  const debouncedSave = useMemo(
    () =>
      debounce((state: EditorState) => {
        const doc = readDocFromEditorState(state);
        onDocChange?.(doc);
        const key = skRef.current;
        if (key) {
          try {
            localStorage.setItem(key, JSON.stringify(doc));
            /* console.log("Saving script to local storage") */
          } catch (err) {
            /* ignore quota/storage errors */
            console.error(err)
          }
        }
      }, debounceMs),
    [onDocChange, debounceMs]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      debouncedSave(editorState);
    });
  }, [editor, debouncedSave]);

  // Save immediately on unmount (flush latest state)
  useEffect(() => {
    return () => {
      const doc = readDocFromEditorState(editor.getEditorState());
      const key = skRef.current;
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(doc));
        } catch {}
      }
      onDocChange?.(doc);
    };
  }, [editor, onDocChange]);

  // Expose helpers for debugging/manual import/export
  useEffect(() => {
    (window as any).__screenplay = (window as any).__screenplay || {};
    const api = (window as any).__screenplay;
    api.export = () => readDocFromEditorState(editor.getEditorState());
    api.import = (doc: ScreenplayDoc) => writeDocToEditor(editor, doc);
    api.clear = () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const ln = LineNode.create("action");
        ln.setTextContent("");
        root.append(ln);
      });
    };
    return () => {
      delete (window as any).__screenplay;
    };
  }, [editor]);

  return null;
}

/* ---------------- Hook ---------------- */

export function useScreenplayDocSnapshot() {
  const [editor] = useLexicalComposerContext();
  const snapshotRef = useRef<ScreenplayDoc | null>(null);
  const readNow = React.useCallback(() => {
    const doc = readDocFromEditorState(editor.getEditorState());
    snapshotRef.current = doc;
    return doc;
  }, [editor]);
  return { get: () => snapshotRef.current, readNow };
}
