import { FileText, MessageCircle, PersonStanding, User, type LucideIcon } from "lucide-react";

export type LineTypeKey =
  | "scene_header"
  | "action"
  | "character"
  | "dialog";

export interface Line {
  id: string;
  type: LineTypeKey;
  content: string;
}

export interface Scene {
  id: string;
  title: string;
}

export interface LineTypeConfig {
  displayName: string;
  icon: LucideIcon;
  nextLine?: LineTypeKey;
}

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
};
