import { LetterText, LinkIcon, StickyNote } from "lucide-react";
import View from "./View";
import Editor from "./Editor";
import type { CardTypeDefinition } from "../index";

const link: CardTypeDefinition = {
  type: "link",
  name: "Link",
  icon: LinkIcon,
  View,
  Editor,
};

export default link;
