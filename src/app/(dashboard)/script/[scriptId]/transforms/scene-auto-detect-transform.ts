import { TextNode, type LexicalEditor } from "lexical";
import { LineNode } from "../LineNode";

const SCENE_REGEX = /^(int\.|ext\.|int\/ext\.|i\/e\.)\b/i;

function getNearestLineNode(node: TextNode): LineNode | null {
  let parent = node.getParent();
  while (parent != null) {
    if (parent instanceof LineNode) return parent;
    parent = parent.getParent();
  }
  return null;
}

export default function registerSceneAutoDetect(editor: LexicalEditor) {
  return editor.registerNodeTransform(TextNode, (textNode) => {
    const parent = getNearestLineNode(textNode);
    if (!parent) return;

    const text = parent.getTextContent().trim();
    const currentType = parent.getLineType();

    console.log("[SceneAutoDetect] checking", { text, currentType });

    if (SCENE_REGEX.test(text) && currentType !== "scene") {
      // ✅ Use writable
      const writableParent = parent.getWritable();
      writableParent.setLineType("scene");
      console.log("[SceneAutoDetect] MATCH → switched to scene");
    }
  });
}
