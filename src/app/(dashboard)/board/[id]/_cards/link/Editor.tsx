"use client";

import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

export default function LinkCardEditor({
  card,
  onSave,
}: {
  card: any;
  onSave: (updates: any) => void;
}) {
  const [url, setUrl] = useState(card.content || "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { colors } = useTheme();

  // 💾 Debounced auto-save — no validation, no metadata fetching
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onSave({ content: url });
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [url, onSave]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-xl h-full justify-start",
        colors.components.boards.card
      )}
    >
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste or type a link (https://...)"
        className="text-lg"
        autoFocus
      />
    </div>
  );
}
