"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback, type RefObject } from "react";
import {
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LINE_TYPES, type LineTypeKey, type LineTypeData, LINE_STYLES } from "./lineTypes";
import { LineNode } from "./LineNode";
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $getRoot,
  $createTextNode,
  KEY_TAB_COMMAND,
  KEY_ENTER_COMMAND,
  ParagraphNode,
  type EditorConfig,
  type LexicalNode,
  type LexicalEditor,
} from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import registerSceneAutoDetect from "./transforms/scene-auto-detect-transform";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion"
import AutoScrollPlugin from "./plugins/auto-scroll-plugin";
import { setLineTypeSafely, getEnclosingLineNode } from "./utils";
import SceneAutoDetectPlugin from "./plugins/scene-detection-plugin";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { LineDropdownPlugin } from "./plugins/context-menu-plugin";
import NextRecommendedTypePlugin from "./plugins/next-type";
import { SceneSearchPlugin } from "./plugins/scene-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TransitionAutoDetectPlugin from "./plugins/transition-detection-plugin";

// Simple icon components to avoid extra deps
const Dot: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: "currentColor" }} />
);

const shortcuts = [
  {
    combination: "ctrl + s",
    description: "Show a menu of all scenes in the script."
  },
  {
    combination: "ctrl + 1-" + Object.entries(LINE_TYPES).length,
    description: "Switch a line to a different type."
  },
  {
    combination: "tab",
    description: "Cycle between line-types."
  }
]

/**********************
 * Logger utilities
 **********************/
function makeLogger(enabledRef: { current: boolean }) {
  const prefix = "%c[Screenplay]";
  const style = "color:#8b5cf6;font-weight:600"; // violet
  const log = (...args: any[]) => enabledRef.current && console.log(prefix, style, ...args);
  const warn = (...args: any[]) => enabledRef.current && console.warn(prefix, style, ...args);
  const group = (label: string, fn: () => void) => {
    if (!enabledRef.current) return;
    console.groupCollapsed(prefix + " " + label, style);
    try { fn(); } finally { console.groupEnd(); }
  };
  return { log, warn, group };
}

/**********************
 * Types
 **********************/
export type Line = {
  id: string;
  type: LineTypeKey;
  content: string;
};

/**********************
 * Theme (Lexical classes)
 **********************/
const theme = {
  paragraph: "screenplay-paragraph",
  text: {
    bold: "font-semibold",
    italic: "italic",
  },
};

/**********************
 * Layout helpers
 **********************/
const A4_RATIO = 297 / 210; // height / width
const BASE_PAGE_WIDTH = 794; // px baseline (approx A4 @ ~96dpi margins)

function usePageMetrics(containerRef: React.RefObject<HTMLDivElement>) {
  const [metrics, setMetrics] = useState({
    pageWidth: BASE_PAGE_WIDTH,
    pageHeight: Math.round(BASE_PAGE_WIDTH * A4_RATIO),
    scale: 1,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const vw = el.clientWidth;
      const max = BASE_PAGE_WIDTH;
      const pageWidth = Math.min(vw, max);
      const pageHeight = Math.round(pageWidth * A4_RATIO);
      const scale = pageWidth / BASE_PAGE_WIDTH;
      setMetrics({ pageWidth, pageHeight, scale });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return metrics;
}

function registerLineNodeTransform(editor: LexicalEditor) {
  return editor.registerNodeTransform(ParagraphNode, (node) => {
    // Already a LineNode? Do nothing
    if (node instanceof LineNode) return;

    // Create a LineNode with same content
    const lineNode = new LineNode("action");
    lineNode.append(...node.getChildren());
    node.replace(lineNode);
  });
}

/**********************
 * Debug plugins
 **********************/
function DebugSelectionPlugin({ enabled }: { enabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const { log, group } = makeLogger(enabledRef);

  useEffect(() => {
    // Log selection and top-level children on every update
    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
      if (!enabledRef.current) return;
      group("Update", () => {
        log("tags:", Array.from(tags || []));
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();
          log(`root has ${children.length} children`);
          children.forEach((child, idx) => {
            const t = child instanceof LineNode ? child.getLineType() : (child as any).constructor.name;
            log(`#${idx}`, "type:", t, "text:", (child as any).getTextContent?.());
          });
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            const anchorNode = sel.anchor.getNode();
            const focusNode = sel.focus.getNode();
            log("selection:", {
              anchorPath: sel.anchor.getNode().getKey?.(),
              anchorOffset: sel.anchor.offset,
              focusPath: sel.focus.getNode().getKey?.(),
              focusOffset: sel.focus.offset,
              isCollapsed: sel.isCollapsed(),
              anchorNode: (anchorNode as any).constructor?.name,
              focusNode: (focusNode as any).constructor?.name,
            });
          } else {
            log("no range selection");
          }
        });
      });
    });
    return () => unregister();
  }, [editor]);

  useEffect(() => {
    // Mutation logger for LineNode lifecycle
    const unregister = editor.registerMutationListener(LineNode, (mutations) => {
      if (!enabledRef.current) return;
      const entries = Array.from(mutations.entries());
      if (entries.length === 0) return;
      console.groupCollapsed("%c[Screenplay] LineNode mutations", "color:#8b5cf6;font-weight:600");
      try {
        entries.forEach(([key, type]) => console.log("node", key, type));
      } finally {
        console.groupEnd();
      }
    });
    return () => unregister();
  }, [editor]);

  return null;
}

const TYPE_ORDER = Object.keys(LINE_TYPES) as LineTypeKey[];

function DebugExposeEditorPlugin({ enabled }: { enabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!enabled) return;
    (window as any).__screenplayEditor = editor;
    return () => { delete (window as any).__screenplayEditor; };
  }, [editor, enabled]);
  return null;
}

/**********************
 * Screenplay helpers
 **********************/
const TYPE_SHORTCUTS: Array<[RegExp, LineTypeKey]> = [
  [/^(int\.|ext\.|int\/ext\.|i\/e\.)\b/i, "scene"],
  [/^cut to:$/i, "transition"],
  [/^fade (in|out):?$/i, "transition"],
];

function cycleType(t: LineTypeKey): LineTypeKey {
  const order = Object.entries(LINE_TYPES).map(([key]) => key as LineTypeKey);
  const i = order.indexOf(t);
  return order[(i + 1) % order.length] as LineTypeKey;
}

function createTextNodesFromContent(text: string) {
  return text.split(/\n/).map((t: string, i: number) => {
    const n = $createTextNode(t);
    if (i > 0) n.setMode("normal");
    return n;
  });
}

/**********************
 * Plugins
 **********************/
function ScreenplayKeybindingsPlugin({ debug }: { debug: boolean }) {
  const [editor] = useLexicalComposerContext();
  const enabledRef = useRef(debug);
  enabledRef.current = debug;
  const { log } = makeLogger(enabledRef);

  // Enter-based type switching (post-enter)
  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        event?.preventDefault();
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchorNode = selection.anchor.getNode();
          const currentLine = anchorNode.getParentOrThrow();
          if (!(currentLine instanceof LineNode)) return;

          // Determine next line type based on current line
          const nextType: LineTypeKey = LINE_TYPES[currentLine.getLineType()]?.nextLine || "action";
          const newLine = LineNode.create(nextType);
          console.log(currentLine, nextType, newLine)
          currentLine.insertAfter(newLine);

          // Check TYPE_SHORTCUTS for auto type
          const text = currentLine.getTextContent();
          for (const [regex, type] of TYPE_SHORTCUTS) {
            if (regex.test(text)) {
              setLineTypeSafely(editor, currentLine, type);
              break;
            }
          }

          // Ensure new line has at least one text node
          if (newLine.getChildrenSize() === 0) {
            newLine.append($createTextNode(""));
          }
        });
        return true;
      },
      0
    );
  }, [editor]);

  // Tab: cycle line types
useEffect(() => {
  return editor.registerCommand(
    KEY_TAB_COMMAND,
    (event: KeyboardEvent) => {
      event?.preventDefault();
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          let lineNode = getEnclosingLineNode(node);

          if (!lineNode) {
            // no LineNode? make a new one
            lineNode = LineNode.create("action");
            const root = $getRoot();
            root.append(lineNode);
          }

          const currentType = lineNode.getLineType();
          const nextType = cycleType(currentType);
          setLineTypeSafely(editor, lineNode, nextType);
        }
      });
      return true;
    },
    0
  );
}, [editor]);

  // --- CTRL + number shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      const keyNum = parseInt(e.key);
      if (isNaN(keyNum) || keyNum < 1 || keyNum > TYPE_ORDER.length) return;

      const targetType = TYPE_ORDER[keyNum - 1] || "action";
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          let lineNode = getEnclosingLineNode(node);

          if (!lineNode) {
            // no LineNode? make a new one
            lineNode = LineNode.create("action");
            const root = $getRoot();
            root.append(lineNode);
          }

          setLineTypeSafely(editor, lineNode, targetType);
        }
      });
      e.preventDefault();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor]);


  return null;
}

function ScreenplayInitPlugin({ defaultContent, debug }: { defaultContent?: { lines?: Line[] }; debug: boolean }) {
  const [editor] = useLexicalComposerContext();
  const enabledRef = useRef(debug);
  enabledRef.current = debug;
  const { log, group } = makeLogger(enabledRef);

useEffect(() => {
  // Keeps ParagraphNode → LineNode
  const unregisterLineTransform = registerLineNodeTransform(editor);

  // Auto-scene detection
  const unregisterSceneTransform = registerSceneAutoDetect(editor)
  return () => {
    unregisterLineTransform();
    unregisterSceneTransform();
  };
}, [editor]);
  
useEffect(() => {
  editor.update(() => {
    const root = $getRoot();
    if (root.getFirstChild() != null) return;

    const seed = defaultContent?.lines ?? [
      { type: "scene", content: "INT. LIVING ROOM — NIGHT" },
      { type: "action", content: "A cat jumps onto the table." },
      { type: "character", content: "ALICE" },
      { type: "dialogue", content: "We should leave." },
    ];

    seed.forEach((line) => {
      const p = new LineNode(line.type);
      p.append(...createTextNodesFromContent(line.content));
      root.append(p);
    });
  });
}, [editor, defaultContent]);

  return null;
}

/**********************
 * Toolbar
 **********************/
function Toolbar({ debug, setDebug }: { debug: boolean; setDebug: (v: boolean) => void }) {
  const [editor] = useLexicalComposerContext();
  const [currentLineType, setCurrentLineType] = useState<LineTypeKey>("action");

  // Track current line type under caret (read-only)
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
    // console.log("Selection after update:", selection ? selection.getTextContent() : "null");
        if (!$isRangeSelection(selection)) return;
        const node = selection.anchor.getNode();
        const parent = node.getParent();
        const target = parent && !$isRootOrShadowRoot(parent) ? parent : node;

        const type = target instanceof LineNode ? target.getLineType() : "action";
        setCurrentLineType(type);
      });
    });
    return () => unregister();
  }, [editor]);

  const setType = useCallback(
    (t: LineTypeKey) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          let lineNode = getEnclosingLineNode(node);
          if (!lineNode) {
            // no LineNode? make a new one
            lineNode = LineNode.create("action");
            const root = $getRoot();
            root.append(lineNode);
          }

          setLineTypeSafely(editor, lineNode, t);
        }
      });
    },
    [editor]
  );

  const { colors } = useTheme()

  return (
    <div className={cn(colors.editor.toolbar.background, "fixed w-fit rounded-xl top-18 z-10 px-6 py-4 backdrop-blur-xl left-0 right-0 mx-auto mb-2 flex flex-col items-start gap-2 text-sm select-none")}>
      <div className="flex flex-row gap-4 flex-wrap">
        {Object.entries(LINE_TYPES).map(([key, data], i) => {
          const typeKey = key as LineTypeKey;
          const isActive = currentLineType === typeKey;
          const Icon = data.icon;
          return (
            <Tooltip key={key}>
              <TooltipTrigger>
                <motion.div
                  // type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()} // 👈 keeps focus in editor
                  onClick={() => setType(typeKey)} // uses your setType callback
                  className={`px-2.5 py-1 text-md cursor-pointer rounded-sm border-2 flex items-center gap-2 ${
                    isActive
                    ? colors.editor.toolbar.activeButton
                    : colors.editor.toolbar.inactiveButton
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  >
                  <Icon size={16} />
                  <span className={cn("text-sm hidden lg:flex", isActive ? "sm:flex" : "")}>{data.displayName}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>CTRL + {i+1}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
                  <Shortcuts />
      </div>

      {/* <div className="ml-auto flex items-center gap-3 text-neutral-600">
        <span>Tab: cycle types • Enter: shortcuts</span>
        <label className="inline-flex items-center gap-1 cursor-pointer select-none">
          <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
          <span>Debug</span>
        </label>
      </div> */}
    </div>
  );
}

/**********************
 * Placeholder
 **********************/
function Placeholder() {
  return (
    <div className="text-neutral-400 pointer-events-none" style={{ position: "absolute" }}>
      Start writing your screenplay…
    </div>
  );
}

function Shortcuts () {

  const { colors } = useTheme()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent cursor-pointer">Shortcuts</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shortcuts</DialogTitle>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {shortcuts.map((shortcut, i) => (
            <li key={shortcut.combination} className="flex items-center gap-3">
              {/* Shortcut key combination badge */}
              <span
                className={cn(
                  "inline-block px-2 py-1 rounded bg-gray-700 text-white text-sm font-mono",
                  colors.background
                )}
              >
                {shortcut.combination}
              </span>
              
              {/* Description */}
              <span className="text-sm text-gray-300">{shortcut.description}</span>
            </li>
          ))}
        </ul>

      </DialogContent>
    </Dialog>
  )
}

/**********************
 * Main Editor (exported)
 **********************/
export default function ScreenplayEditor({ defaultContent }: { defaultContent?: { lines?: Line[] } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pageWidth, pageHeight, scale } = usePageMetrics(containerRef as RefObject<HTMLDivElement>);
  const [debug, setDebug] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("screenplay-debug") === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("screenplay-debug", debug ? "1" : "0");
    }
  }, [debug]);

  const initialConfig = useMemo(() => ({
    namespace: "screenplay-editor",
    theme,
    onError(error: Error) {
      console.error("[Screenplay] Lexical error:", error);
    },
    nodes: [LineNode],
  }), []);

  const styleVars: React.CSSProperties = {
    ["--page-w" as any]: `${pageWidth}px`,
    ["--page-h" as any]: `${pageHeight}px`,
    ["--scale" as any]: String(scale),
    ["--base-font" as any]: `16px`,
    ["--indent" as any]: `calc(1ch * var(--scale))`,
    ["--page-padding" as any]: `calc(48px * var(--scale))`,
    ["--line-gap" as any]: `calc(8px * var(--scale))`,
  };

  const { colors } = useTheme()

  return (
    <div className={cn("w-full min-h-screen flex flex-col items-center", colors.background)} ref={containerRef}>
      <div className="w-full mt-28 max-w-full" style={styleVars}>
        <LexicalComposer initialConfig={initialConfig}>
          <Toolbar debug={debug} setDebug={setDebug} />

          <div
            className={cn("mx-auto border-1 rounded-sm shadow-xl relative overflow-auto",
              colors.cardBackground, colors.cardBorder
            )}
            style={{
              width: "var(--page-w)",
              minHeight: "var(--page-h)",
              padding: "var(--page-padding)",
              fontSize: "calc(var(--base-font) * var(--scale))",
              lineHeight: 1.5,
              outline: "none",
              color: "white",
              backgroundSize: `100% var(--page-h)`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn("outline-none screenplay-content line", colors.text)}
                  style={{ minHeight: "var(--page-h)" }}
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />

            <HistoryPlugin />
            <AutoScrollPlugin />
            <SceneAutoDetectPlugin />
            <TransitionAutoDetectPlugin />
            <NextRecommendedTypePlugin />
            <SceneSearchPlugin />
            <LineDropdownPlugin />
            {/* Log full editor state diffs */}
            <OnChangePlugin
              onChange={(editorState, editor) => {
                if (!debug) return;
                editorState.read(() => {
                  const root = $getRoot();
                  const children = root.getChildren();
                  const snapshot = children.map((c, idx) => ({
                    idx,
                    key: (c as any).getKey?.(),
                    type: c instanceof LineNode ? c.getLineType() : (c as any).constructor?.name,
                    text: (c as any).getTextContent?.(),
                  }));
                  // console.table(snapshot);
                });
              }}
            />

            <ScreenplayKeybindingsPlugin debug={debug} />
            <ScreenplayInitPlugin defaultContent={defaultContent} debug={debug} />
            <DebugSelectionPlugin enabled={debug} />
            <DebugExposeEditorPlugin enabled={debug} />
          </div>
        </LexicalComposer>

        <div className="mx-auto flex justify-between text-xs text-neutral-600 mt-2" style={{ width: "var(--page-w)" }}>
          <span>A4 page width: {Math.round(pageWidth)} px</span>
          <span>Scale: {scale.toFixed(2)}×</span>
        </div>
      </div>


    </div>
  );
}


export function LineNodePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(ParagraphNode, (node) => {
      if (!(node instanceof LineNode)) {
        // Use node.getKey() which returns NodeKey (string internally)
        const lineNode = LineNode.create("action");
        lineNode.append(...node.getChildren());
        node.replace(lineNode);
      }
    });
  }, [editor]);

  return null;
}


function Page({
  lines,
  editable,
  pageWidth,
  pageHeight,
}: {
  lines: LineNode[];
  editable: boolean;
  pageWidth: number;
  pageHeight: number;
}) {
    const [debug, setDebug] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("screenplay-debug") === "1";
  });
  const {colors} = useTheme()

    const initialConfig = useMemo(() => ({
    namespace: "screenplay-editor",
    theme,
    onError(error: Error) {
      console.error("[Screenplay] Lexical error:", error);
    },
    nodes: [LineNode],
  }), []);



  return (
    <div
      className="screenplay-page mx-auto border shadow-lg relative overflow-hidden"
      style={{
        width: pageWidth,
        height: pageHeight,
        padding: "48px",
        background: "#1f1f1f",
      }}
    >
      {editable ? (
<LexicalComposer initialConfig={initialConfig}>
          <Toolbar debug={debug} setDebug={setDebug} />

          <div
            className={cn("mx-auto border-1 rounded-xl shadow-xl relative overflow-auto",
              colors.cardBackground, colors.cardBorder
            )}
            style={{
              width: "var(--page-w)",
              minHeight: "var(--page-h)",
              padding: "var(--page-padding)",
              fontSize: "calc(var(--base-font) * var(--scale))",
              lineHeight: 1.5,
              outline: "none",
              color: "white",
              backgroundSize: `100% var(--page-h)`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn("outline-none screenplay-content line", colors.text)}
                  style={{ minHeight: "var(--page-h)" }}
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />

            <HistoryPlugin />

            {/* Log full editor state diffs */}
            <OnChangePlugin
              onChange={(editorState, editor) => {
                if (!debug) return;
                editorState.read(() => {
                  const root = $getRoot();
                  const children = root.getChildren();
                  const snapshot = children.map((c, idx) => ({
                    idx,
                    key: (c as any).getKey?.(),
                    type: c instanceof LineNode ? c.getLineType() : (c as any).constructor?.name,
                    text: (c as any).getTextContent?.(),
                  }));
                  // console.table(snapshot);
                });
              }}
            />

            <ScreenplayKeybindingsPlugin debug={debug} />
            <ScreenplayInitPlugin debug={debug} />
            <DebugSelectionPlugin enabled={debug} />
            <DebugExposeEditorPlugin enabled={debug} />
          </div>
        </LexicalComposer>
      ) : (
        <div className="read-only-content">
          {lines.map((line) => (
            <div key={line.getKey()} className={LINE_STYLES[line.getLineType()]}>
              {line.getTextContent()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}