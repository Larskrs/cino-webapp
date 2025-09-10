"use client";

import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { getEnclosingLineNode } from "../utils";
import { cn } from "@/lib/utils";
import { LINE_TYPES, type LineTypeKey } from "../lineTypes";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

export function LineSwitchPlugin() {
  const [editor] = useLexicalComposerContext();
  const [iconPos, setIconPos] = React.useState<{ top: number; left: number } | null>(null);
  const [currentLineType, setCurrentLineType] = React.useState<string | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIconPos(null);
          return;
        }

        const node = selection.anchor.getNode();
        const lineNode = getEnclosingLineNode(node);
        if (!lineNode) {
          setIconPos(null);
          return;
        }

        const dom = editor.getElementByKey(lineNode.getKey());
        if (dom) {
          const rect = dom.getBoundingClientRect();
          const editorRoot = editor.getRootElement();
          if (!editorRoot) return;
          const containerRect = editorRoot.getBoundingClientRect();
        
          // vertical center of the DOM element
          const verticalCenter = rect.top - containerRect.top + editorRoot.scrollTop + rect.height / 2;
        
          setIconPos({
            top: verticalCenter,
            left: rect.left - containerRect.left + editorRoot.scrollLeft - 20, // offset left if needed
          });
        }

        setCurrentLineType(lineNode.getLineType());
      });
    });
  }, [editor]);

  React.useEffect(() => {
    setShowTypeDropdown(false);
  }, [currentLineType]);

  const { colors } = useTheme();

  // framer-motion variants
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    hover: { scale: 1.05 },
  };

  return (
    <>
      {/* icon for current line */}
      {iconPos && currentLineType && (
        <motion.button
          key={currentLineType} // triggers animation whenever icon type changes
          className={cn(
            "absolute cursor-pointer text-neutral-400 p-1 rounded-sm",
            colors.components.dropdown.container
          )}
          style={{ top: iconPos.top, left: iconPos.left }}
          onClick={() => setShowTypeDropdown((prev) => !prev)}
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          exit={{ scale: 1}}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {React.createElement(
            LINE_TYPES[currentLineType as LineTypeKey]?.icon,
            { size: 20 }
          )}
        </motion.button>
      )}

      {/* type dropdown */}
      <AnimatePresence>
        {showTypeDropdown && iconPos && (
          <motion.div
            className={cn(colors.components.dropdown.container, "absolute w-fit z-50 rounded-md shadow-lg flex flex-col")}
            style={{ top: iconPos.top + 32, left: iconPos.left }}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {Object.entries(LINE_TYPES).map(([key, def]) => (
              <motion.button
                key={key}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-sm text-left rounded",
                  "cursor-pointer",
                  colors.components.dropdown.button,
                )}
                variants={buttonVariants}
                whileHover="hover"
                onClick={() => {
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      const node = selection.anchor.getNode();
                      const lineNode = getEnclosingLineNode(node);
                      if (lineNode) {
                        lineNode.setLineType(key as LineTypeKey);
                        setCurrentLineType(key);
                      }
                    }
                  });
                  setShowTypeDropdown(false);
                }}
              >
                {React.createElement(def.icon, { size: 16 })}
                <span className="capitalize">{def.displayName ?? key}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
