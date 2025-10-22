"use client";

import { motion } from "framer-motion";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardProps } from "./_cards"; 
import { useTheme } from "@/hooks/use-theme";

interface Props {
  card: CardProps;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function CardContextMenu({ card, onEdit, onDuplicate, onDelete }: Props) {

    const { colors } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -2 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "rounded-md border min-w-[160px]",
        "overflow-hidden select-none text-sm",
        colors.background, colors.cardBorder
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-2 px-4 py-2 transition-colors"
      >
        <Pencil size={16} />
        Edit
      </button>

      <button
        onClick={onDuplicate}
        className="w-full flex items-center gap-2 px-4 py-2 transition-colors"
      >
        <Copy size={16} />
        Duplicate
      </button>

      <div className="h-px bg-neutral-200 mx-1 my-1" />

      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 transition-colors"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </motion.div>
  );
}
