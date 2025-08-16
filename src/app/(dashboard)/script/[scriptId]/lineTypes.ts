import { FileText, Edit3, User, MessageCircle, type LucideIcon, PersonStanding } from "lucide-react";

export type LineTypeKey = "scene_header" | "action" | "character" | "dialog" | "page_start";

export type LineTypeData = {
  displayName: string;
  icon: LucideIcon;
  nextLine?: LineTypeKey;
};

export const LINE_TYPES: Record<LineTypeKey, LineTypeData> = {
  scene_header: {
    displayName: "Scene Header",
    icon: FileText,
    nextLine: "action",
  },
  action: {
    displayName: "Action",
    icon: PersonStanding,
    nextLine: "action",
  },
  character: {
    displayName: "Character",
    icon: User,
    nextLine: "dialog",
  },
  dialog: {
    displayName: "Dialog",
    icon: MessageCircle,
    nextLine: "dialog",
  },
  page_start: {
    displayName: "Page Break",
    icon: FileText,
    nextLine: "scene_header",
  },
};

// Now your Line type remains mostly the same:
export type Line = {
  id: string;
  type: LineTypeKey;
  content: string;
};

