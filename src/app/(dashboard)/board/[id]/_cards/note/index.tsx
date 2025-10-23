import { LetterText, StickyNote } from "lucide-react";
import View from "./View";
import Editor from "./Editor";
import type { CardTypeDefinition } from "../index";

const text: CardTypeDefinition = {
  type: "note",
  name: "Text Note",
  icon: LetterText,
  View,
  Editor,
};

export default text;
