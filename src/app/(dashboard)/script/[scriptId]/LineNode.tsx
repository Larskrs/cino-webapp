import { ParagraphNode, type EditorConfig } from "lexical";
import { LINE_STYLES, type LineTypeKey } from "./lineTypes";

export class LineNode extends ParagraphNode {
  __lineType: LineTypeKey;

  constructor(lineType: LineTypeKey = "action", key?: string) {
    super(key); // pass the key to ParagraphNode
    this.__lineType = lineType;
  }

  static getType() {
    return "line";
  }

  static clone(node: LineNode) {
    return new LineNode(node.__lineType, node.__key); // preserve key
  }

  getLineType(): LineTypeKey {
    return this.__lineType;
  }

  setLineType(type: LineTypeKey) {
    const writable = this.getWritable();
    (writable as LineNode).__lineType = type;
  }

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
}
