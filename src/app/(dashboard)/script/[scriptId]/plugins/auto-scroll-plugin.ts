import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

export default function AutoScrollPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const domElement = editor.getElementByKey(selection.anchor.key);
        if (!domElement) return;

        const el = domElement as HTMLElement;

        // Scroll so caret/line is centered in viewport
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
      });
    });
  }, [editor]);

  return null;
}
