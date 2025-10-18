import { Image, StickyNote } from "lucide-react";
import View from "./View";
import Editor from "./Editor";
import type { CardTypeDefinition } from "../index";

const text: CardTypeDefinition = {
  type: "image",
  name: "Image",
  icon: Image,
  View,
  Editor,
};

export default text;
