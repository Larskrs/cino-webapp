"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { StickyNote, ImageIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BoardClient({
  board,
  initialCards,
}: {
  board: any;
  initialCards: any[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const utils = api.useUtils();

  const createCard = api.board.create_card.useMutation({
    onSuccess: async () => {
      const newCards = await utils.board.list_cards.fetch({ boardId: board.id });
      setCards(newCards);
    },
  });

  const updateCard = api.board.update_card.useMutation({
    onMutate: (vars) => {
      setCards((cards) =>
        cards.map((c) => (c.id === vars.id ? { ...c, ...vars } : c))
      );
    },
    onSettled: async () => {
      const newCards = await utils.board.list_cards.fetch({ boardId: board.id });
      setCards(newCards);
    },
  });

  // --- Create a new card ---
  const handleAddCard = (type: string) => {
    createCard.mutate({
      boardId: board.id,
      title: "Untitled",
      type,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      color: board.color,
    });
  };

  // --- Edit handling ---
  const startEditing = (card: any) => {
    setEditingId(card.id);
    setDraftTitle(card.title || "");
    setDraftContent(card.content || "");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = (id: string) => {
    updateCard.mutate({
      id,
      title: draftTitle.trim() || "Untitled",
      content: draftContent.trim(),
    });
    utils.board.list_cards.invalidate({ boardId: board.id });
    setEditingId(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleAddCard("text")}
          className="flex gap-1 items-center"
        >
          <StickyNote size={14} /> Note
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleAddCard("image")}
          className="flex gap-1 items-center"
        >
          <ImageIcon size={14} /> Image
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleAddCard("link")}
          className="flex gap-1 items-center"
        >
          <Link2 size={14} /> Link
        </Button>
      </div>

      {/* Cards */}
      <div className="relative w-full h-full">
        {cards.map((card) => {
          const isEditing = editingId === card.id;

          return (
            <motion.div
              key={card.id}
              drag={!isEditing} // 👈 disables dragging while editing
              dragMomentum={false}
              dragElastic={0}
              onDoubleClick={() => startEditing(card)}
              onDragEnd={(_, info) => {
                if (isEditing) return;
                const newX = (card.x || 0) + info.offset.x;
                const newY = (card.y || 0) + info.offset.y;
                updateCard.mutate({ id: card.id, x: newX, y: newY });
              }}
              className={cn(
                "absolute cursor-grab active:cursor-grabbing select-none group",
                "rounded-2xl shadow-lg border border-neutral-300/60 backdrop-blur-md",
                "bg-white/70 text-neutral-800 transition-none duration-150 hover:shadow-xl",
                isEditing && "ring-2 ring-blue-400 cursor-text active:cursor-text"
              )}
              style={{
                x: card.x || 0,
                y: card.y || 0,
                minWidth: 180,
                maxWidth: 280,
                width: "fit-content",
                minHeight: 120,
                height: "auto",
              }}
            >
              {isEditing ? (
                <div className="p-3 flex flex-col gap-2">
                  <input
                    className="font-semibold text-sm border-b border-neutral-300 bg-transparent focus:outline-none focus:border-blue-400"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEdit(card.id);
                      }
                    }}
                  />
                  <textarea
                    ref={inputRef}
                    className="flex-1 text-sm resize-none bg-transparent focus:outline-none"
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    onBlur={() => saveEdit(card.id)}
                    rows={Math.min(6, Math.max(2, draftContent.split("\n").length))}
                    placeholder={
                      card.type === "link"
                        ? "Paste a link..."
                        : card.type === "image"
                        ? "Describe the image..."
                        : "Write something..."
                    }
                  />
                </div>
              ) : (
                <div
                  className="p-3 flex flex-col gap-2"
                  onDoubleClick={() => startEditing(card)}
                >
                  {/* <h4 className="font-semibold text-sm leading-tight">
                    {card.title}
                  </h4> */}

                  {/* Content rendering by type */}
                  {card.type === "text" && (
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap break-words">
                      {card.content || "Double-click to edit..."}
                    </p>
                  )}
                  {card.type === "link" && (
                    <a
                      href={card.content || "#"}
                      target="_blank"
                      className="text-sm text-blue-500 underline break-words hover:text-blue-600"
                    >
                      {card.content || "Add link..."}
                    </a>
                  )}
                  {card.type === "image" && (
                    card.content ? (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={card.content}
                          alt="card"
                          className="pointer-events-none object-cover w-full h-auto rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-neutral-400 text-sm border border-dashed rounded-md">
                        🖼 Add image URL
                      </div>
                    )
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
