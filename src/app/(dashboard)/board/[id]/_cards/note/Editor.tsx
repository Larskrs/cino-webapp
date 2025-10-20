"use client";

import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";

export default function TextCardEditor({
  card,
  onSave,
}: {
  card: any;
  onSave: (updates: any) => void;
}) {
  const [title, setTitle] = useState(card.title || "");
  const [content, setContent] = useState(card.content || "");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔁 Update state if the card changes externally
  useEffect(() => {
    setTitle(card.title || "");
    setContent(card.content || "");
  }, [card.id, card.title, card.content]);

  // 💾 Debounced auto-save after 1 second of inactivity
  useEffect(() => {
    if (!content && !title) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onSave({ title, content });
    }, 10); // 1 second delay

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [title, content, onSave]);

  return (
    <div className="flex flex-col gap-3 p-0 h-full">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
        style={{fontSize: "18px"}}
        className="text-2xl resize-none bg-transparent rounded-0 p-4 min-h-30 outline-none border-0"
      />
    </div>
  );
}
