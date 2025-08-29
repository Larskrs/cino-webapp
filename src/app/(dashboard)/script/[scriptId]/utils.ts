import { $createTextNode, $getRoot, $isRootOrShadowRoot, type LexicalEditor, type LexicalNode } from "lexical";
import { LineNode } from "./LineNode";
import type { LineTypeKey } from "./lineTypes";

export function setLineTypeSafely(editor: LexicalEditor, lineNode: LineNode, type: LineTypeKey) {
  lineNode.setLineType(type);

  if (lineNode.getChildren().length === 0) {
    const textNode = $createTextNode("");
    lineNode.append(textNode);

    // Now select the new node safely
    textNode.select(0, 0);
  }
}
export function getEnclosingLineNode(node: LexicalNode): LineNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if (current instanceof LineNode) return current;
    if ($isRootOrShadowRoot(current)) return null;
    current = current.getParent();
  }
  return null;
}

export function getAllLinesByType(editor: any, type: LineTypeKey) {
  const root = $getRoot();
  const nodes = root.getChildren();
  return nodes.filter(
    (node) =>
      node instanceof LineNode &&
      node.getLineType() === type &&
      node.getTextContent().trim() !== ""
  ) as LineNode[];
}


export function getScenesWithIndex(editor: any) {
  const scenes = getAllLinesByType(editor, "scene");
  return scenes.map((sceneNode, idx) => ({
    index: idx + 1, // 1-based
    text: sceneNode.getTextContent(),
    node: sceneNode,
  }));
}