import { ParagraphNode, TextNode, type EditorConfig } from "lexical";
import { LINE_STYLES, LINE_TYPES, type LineTypeKey } from "./lineTypes";

export class LineNode extends ParagraphNode {
  __lineType: LineTypeKey;

  constructor(lineType: LineTypeKey = "action", key?: string) {
    super(key);
    this.__lineType = lineType;
  }

  static getType() {
    return "line";
  }

  static clone(node: LineNode) {
    return new LineNode(node.__lineType, node.__key);
  }

  getLineType(): LineTypeKey {
    return this.__lineType;
  }

  setLineType(type: LineTypeKey) {
    const writable = this.getWritable();
    (writable as LineNode).__lineType = type;
  }

  /** 🔑 Make sure a line always has a text node */
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = LINE_STYLES[this.__lineType];
    dom.setAttribute("data-line-type", this.__lineType);
    return dom;
  }

  updateDOM(prevNode: LineNode, dom: HTMLElement): boolean {
    if (prevNode.__lineType !== this.__lineType) {
      dom.className = LINE_STYLES[this.__lineType];
      dom.setAttribute("data-line-type", this.__lineType);
      return true;
    }
    return false;
  }

  // 👇 This hook runs after every update
  // If line has no children, inject an empty text node
  insertNewAfter(_: unknown, restoreSelection: boolean = true): LineNode {
    const newLine = new LineNode(LINE_TYPES[this?.__lineType].nextLine);
    if (restoreSelection && newLine.getChildren().length === 0) {
      newLine.append(newLine);
    }
    this.insertAfter(newLine);
    return newLine;
  }

  // Factory helper
  static create(lineType: LineTypeKey = "action"): LineNode {
    const node = new LineNode(lineType);
    node.append(new TextNode("")); // ✅ always editable
    return node;
  }
}
