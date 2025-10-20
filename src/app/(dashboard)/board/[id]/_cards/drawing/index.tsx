import { PenTool } from "lucide-react";
import View from "./View";
import Editor from "./Editor";
import type { CardTypeDefinition } from "../index";

const drawing: CardTypeDefinition = {
  type: "drawing",
  name: "Drawing",
  icon: PenTool,
  View,
  Editor,
};

export default drawing;
