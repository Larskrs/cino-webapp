import { StickyNote, ImageIcon, Link2, type LucideIcon } from "lucide-react";

export interface CardProps {
  id: string;
  type: CardTypeKey;
  title?: string;
  content?: string;
  x?: number;
  y?: number;
  color?: string;
  width?: number;
  height?: number;
}

export interface CardEditorProps {
  card: CardProps;
  onSave: (updates: Partial<CardProps>) => void;
  closeEditor?: () => void
}

export interface CardTypeDefinition {
  type: CardTypeKey;
  name: string;
  icon: LucideIcon;
  View: React.FC<{ card: CardProps }>;
  Editor: React.FC<CardEditorProps>;
}

// --- Individual card imports ---
import note from "./note"
import image from "./image"
import drawing from "./drawing";
import heading from "./heading"

export const CARD_TYPES = {
  heading,
  note,
  image,
  drawing,
} as const;

export type CardTypeKey = keyof typeof CARD_TYPES;
export type CardTypeMap = typeof CARD_TYPES;
