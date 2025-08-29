import { FileText, Edit3, User, MessageCircle, type LucideIcon, PersonStanding, ArrowRight, QuoteIcon } from "lucide-react";

export type LineTypeKey =
  | "scene"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"

export type LineTypeData = {
  displayName: string;
  icon: LucideIcon;
  nextLine?: LineTypeKey;
};

export const LINE_TYPES: Record<LineTypeKey, LineTypeData> = {
  action: {
    displayName: "Action",
    icon: PersonStanding,
    nextLine: "action",
  },
  character: {
    displayName: "Character",
    icon: User,
    nextLine: "dialogue",
  },
  dialogue: {
    displayName: "Dialogue",
    icon: MessageCircle,
    nextLine: "character",
  },
  scene: {
    displayName: "Scene Header",
    icon: FileText,
    nextLine: "action",
  },
  parenthetical: {
    displayName: "Parenthetical",
    icon: QuoteIcon,
    nextLine: "dialogue",
  },
  transition: {
    displayName: "Transition",
    icon: ArrowRight,
    nextLine: "scene",
  },
};

// Line type
export type Line = {
  id: string;
  type: LineTypeKey;
  content: string;
};

export const LINE_STYLES: Record<LineTypeKey, string> = {
  scene: "line-scene",
  action: "line-action",
  character: "line-character",
  dialogue: "line-dialogue",
  parenthetical: "line-parenthetical",
  transition: "line-transition",
};
