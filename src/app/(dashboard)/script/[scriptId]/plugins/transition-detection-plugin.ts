import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
} from "lexical";
import { LineNode } from "../LineNode"; // your custom LineNode
import { setLineTypeSafely } from "../utils"; // helper you made

function TransitionAutoDetectPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      // Only check if node is selected
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      if (anchorNode.getKey() !== node.getKey()) return;

      const text = node.getTextContent().trim().toUpperCase();

      if (text === "FADE TO:" || text === "CUT TO:") {
        const parent = node.getParent();
        if (parent instanceof LineNode) {
          setLineTypeSafely(editor, parent, "transition");
        }
      }
    });
  }, [editor]);

  return null;
}

export default TransitionAutoDetectPlugin;
