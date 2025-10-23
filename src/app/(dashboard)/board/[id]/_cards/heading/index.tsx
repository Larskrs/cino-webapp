import { LetterText, StickyNote, Type } from "lucide-react";
import View from "./View";
import Editor from "./Editor";
import type { CardTypeDefinition } from "../index";

const heading: CardTypeDefinition = {
  type: "heading",
  name: "Heading",
  icon: Type,
  View,
  Editor,
};

export default heading;
