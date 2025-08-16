import { Extension } from "@tiptap/react";

export const AutoCapsExtension = Extension.create({
  onUpdate() {
    const text = this.editor.getText();
    const lastLine = text.split("\n").pop();
    if (lastLine?.match(/^(INT\.|EXT\.)/i)) {
      this.editor.chain().setMark('bold').run();
      this.editor.commands.insertContent(lastLine.toUpperCase());
    }
  }
});


export default AutoCapsExtension