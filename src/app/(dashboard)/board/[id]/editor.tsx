"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CARD_TYPES, type CardTypeKey, type CardProps } from "./_cards";
import { useTheme } from "@/hooks/use-theme";
import { Plus, Minus, Undo2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DraggableCard from "./draggable-card";
import Link from "next/link";
import { useContextMenu } from "@/hooks/context-menu-provider";
import { CardContextMenu } from "./card-context-menu";

type Vec2 = { x: number; y: number };

const CARD_SIZE_FACTOR = 1.5;

// Which fields are editable via the side editor (NO position/size here)
const EDITABLE_KEYS: (keyof CardProps)[] = ["title", "content", "color", "type"];
const pickEditable = (c: Partial<CardProps>) =>
  Object.fromEntries(
    Object.entries(c).filter(([k]) => EDITABLE_KEYS.includes(k as keyof CardProps))
  ) as Partial<CardProps>;

export default function BoardClient({
  board,
  initialCards,
}: {
  board: any;
  initialCards: CardProps[];
}) {
  const [cards, setCards] = useState<CardProps[]>(initialCards);
  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const [selected, setSelected] = useState<CardProps | null>(null);

  // Grid
  const GRID_SIZE = 8; // 👈 all movement will snap to this multiple

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  // Local-only editable fields while editor is open (never x/y/width/height)
  const [editedFields, setEditedFields] = useState<Record<string, Partial<CardProps>>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [zoomDisplay, setZoomDisplay] = useState("100%");

  // Per-card status
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  const { colors } = useTheme();
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoomRef = useRef(1);
  const offsetRef = useRef<Vec2>({ x: 0, y: 0 });
  const panStart = useRef<Vec2 | null>(null);
  const raf = useRef<number>(0);

  // === tRPC Mutations ===
  const create = api.board.create_card.useMutation({
    onMutate: async (newCard) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticCard: CardProps = {
        id: tempId,
        ...newCard,
        x: newCard.x ?? 100,
        y: newCard.y ?? 100,
        changedAt: Date.now(),
      } as CardProps;

      setCards((prev) => [...prev, optimisticCard]);
      return { tempId };
    },
    onError: (err, _vars, ctx) => {
      console.error("Failed to create card:", err);
      if (ctx?.tempId) setCards((prev) => prev.filter((c) => c.id !== ctx.tempId));
    },
    onSuccess: (serverCard, _vars, ctx) => {
      if (ctx?.tempId) {
        setCards((prev: any) => prev.map((c: any) => (c.id === ctx.tempId ? serverCard : c)));
      } else {
        setCards((prev: any) => [...prev, serverCard]);
      }
    },
  });

  const update = api.board.update_card.useMutation({
    onMutate: async (v:any) => {
      setSavingIds((s) => new Set(s).add(v.id));
      setCards((prev) =>
        prev.map((c) => (c.id === v.id ? { ...c, ...v, changedAt: Date.now() } : c))
      );
    },
    onSettled: (_d, _e, v) => {
      if (!v?.id) return;
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(v.id);
        return n;
      });
    },
  });

  const deleteCard = api.board.delete_card.useMutation({
    onMutate: async ({ id }) => {
      const previousCards = cardsRef.current;
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      return { previousCards };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousCards) setCards(ctx.previousCards);
    },
    onSuccess: (res) => {
      setCards((prev) => prev.filter((c) => c.id !== res.id));
      if (selected?.id === res.id) setSelected(null);
    },
  });

  const handleDelete = (id: string) => deleteCard.mutate({ id });

  // Keep `selected` fresh (no editor resync)
  useEffect(() => {
    if (!selected) return;
    const fresh = cards.find((c) => c.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [cards, selected]);

  // Save & clear local buffer (only editable fields)
  const saveCard = (card: CardProps | null) => {
    if (!card) return;
    const pending = editedFields[card.id];
    if (!pending) return;

    const clean = pickEditable(pending);

    // Optimistic apply (content-only)
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, ...clean, changedAt: Date.now() } : c))
    );

    // Commit
    setSavingIds((s) => new Set(s).add(card.id));
    update.mutate({ id: card.id, ...clean });

    // Clear buffer
    setEditedFields((prev) => {
      const copy = { ...prev };
      delete copy[card.id];
      return copy;
    });
  };

  const addCard = (type: CardTypeKey) =>
    create.mutate({
      boardId: board.id,
      title: "Untitled",
      type,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      color: board.color,
    });

  // === Compute board bounds ===
  const computeBounds = useCallback(() => {
    if (!cardsRef.current.length) return { minX: 0, minY: 0, maxX: 1000, maxY: 800 };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const c of cardsRef.current) {
      const w = (c?.width ?? 200) * CARD_SIZE_FACTOR;
      const h = c?.height ?? 120;
      minX = Math.min(minX, c.x ?? 0);
      minY = Math.min(minY, c.y ?? 0);
      maxX = Math.max(maxX, (c.x ?? 0) + w);
      maxY = Math.max(maxY, (c.y ?? 0) + h);
    }
    return { minX, minY, maxX, maxY };
  }, []);

  // === GPU Transform Loop ===
  const applyTransform = useCallback(() => {
    if (canvasRef.current) {
      const { x, y } = offsetRef.current;
      const z = zoomRef.current;
      canvasRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`;
    }
    raf.current = requestAnimationFrame(applyTransform);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(applyTransform);
    return () => cancelAnimationFrame(raf.current!);
  }, [applyTransform]);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  // === Wheel zoom and pan ===
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!boardRef.current) return;
      const bounds = computeBounds();
      const margin = 400;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const intensity = Math.min(Math.abs(e.deltaY) / 50, 10);
        const nextZoom = clamp(zoomRef.current * (1 - e.deltaY * 0.01 * intensity), 0.5, 2);
        zoomRef.current = nextZoom;
        setZoomDisplay(`${Math.round(zoomRef.current * 100)}%`);
      } else {
        offsetRef.current.x -= e.deltaX;
        offsetRef.current.y -= e.deltaY;
        const w = boardRef.current.clientWidth;
        const h = boardRef.current.clientHeight;
        offsetRef.current.x = clamp(offsetRef.current.x, -bounds.maxX - margin, w - bounds.minX + margin);
        offsetRef.current.y = clamp(offsetRef.current.y, -bounds.maxY - margin, h - bounds.minY + margin);
      }
    },
    [computeBounds]
  );

  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // === Pointer pan ===
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.shiftKey) {
      panStart.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetRef.current.x += dx;
    offsetRef.current.y += dy;
  };

  const stopPan = () => (panStart.current = null);

  // === Keyboard Zoom Control (Cmd/Ctrl +/−/0) ===
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ["=", "+", "-", "0"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "=" || e.key === "+") adjustZoom(0.1);
        if (e.key === "-") adjustZoom(-0.1);
        if (e.key === "0") resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Delete key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
      if (!selected) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDelete(selected.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  // === Button controls ===
  const adjustZoom = (delta: number) => {
    zoomRef.current = clamp(zoomRef.current + delta, 0.5, 1.8);
    setZoomDisplay(`${Math.round(zoomRef.current * 100)}%`);
  };

  const resetZoom = () => {
    const bounds = computeBounds();
    const el = boardRef.current;
    if (!el) return;
    zoomRef.current = 1;
    const centerX = el.clientWidth / 2 - (bounds.minX + bounds.maxX) / 2;
    const centerY = el.clientHeight / 2 - (bounds.minY + bounds.maxY) / 2;
    offsetRef.current = { x: centerX, y: centerY };
    setZoomDisplay("100%");
  };

  // === Selection helpers ===
  const selectCard = (card: CardProps) => {
    // Switching? Commit previous
    if (selected && selected.id !== card.id) saveCard(selected);
    setSelected(card);

    // Initialize editor buffer ONCE for this card (only editable fields)
    setEditedFields((prev) => {
      if (prev[card.id]) return prev;
      return { ...prev, [card.id]: pickEditable(card) };
    });
  };

  const deselectBoard = () => {
    saveCard(selected);
    setSelected(null);
  };

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<CardProps>();

  // === Layout ===
  return (
    <div
      className={cn(
        "grid relative w-full h-full overflow-hidden",
        "grid-cols-[3rem_1fr_22rem] grid-rows-[1fr]",
        "bg-[radial-gradient(circle,#73737325_1px,transparent_1px)] bg-[size:10px_10px]",
        "grid-cols-[4rem_1fr]"
      )}
      style={{ gridTemplateAreas: `"sidebar board editor"` }}
    >

      {/* Sidebar */}
      <aside
        className={cn(
          "col-[1] row-[1] flex flex-col items-center justify-start border-r border-white/10 backdrop-blur-md p-2 gap-2",
          colors.nav.background
        )}
        style={{ gridArea: "sidebar" }}
      >
        {Object.entries(CARD_TYPES).map(([key, { icon: Icon }]) => (
          <Button
            key={key}
            variant="ghost"
            size="icon"
            onClick={() => addCard(key as CardTypeKey)}
            className="w-full h-auto aspect-square p-2"
          >
            <Icon size={32} className="size-full" />
          </Button>
        ))}
      </aside>

      {/* Board */}
      <section
        ref={boardRef}
        style={{ gridArea: "board" }}
        className="relative overflow-hidden overscroll-x-none bg-transparent touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopPan}
        onPointerLeave={stopPan}
        onClick={(e) => {
          if (e.currentTarget === e.target && selected) deselectBoard();
        }}
      >

      <nav className="absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center bg-transparent w-full p-2 gap-2 z-100">
        <Link href={"/project/" + board?.projectId} className="hover:underline">
          {board?.project?.name}
        </Link>
        <span
          className="size-2 rounded-full"
          style={{ background: board?.color || "gray" }}
        />
        <p>{board?.name}</p>
      </nav>

        <div ref={canvasRef} className="absolute top-0 left-0 origin-top-left will-change-transform">
          {cards.map((card, idx) => {
  const pending = editedFields[card.id];
  const effectiveCard = pending ? { ...card, ...pickEditable(pending) } : card;

  const View = CARD_TYPES[effectiveCard.type]?.View;
  if (!View) return null;

  const isEditingThis = selected?.id === card.id && !!editedFields[selected.id];

  return (
    <DraggableCard
      key={card.id}
      card={effectiveCard}
      zoom={zoomRef.current}              // pass your current zoom
      selected={selected?.id === card.id}
      disabled={isEditingThis}            // disable drag while editing
      bounds={{...computeBounds(), minX: computeBounds().minX / 2, minY: computeBounds().minY / 2}}            // optional, or remove
      onEdit={() => selectCard(card)}
      onContextMenu={(card, e) =>
        openContextMenu(card, e, (data, close) => (
          <CardContextMenu
            card={data}
            onEdit={() => {
              selectCard(data);
              close();
            }}
            onDuplicate={() => {
              //
            }}
            onDelete={() => {
              handleDelete(data.id);
              close();
            }}
          />
        ))
      }
      onMovePreview={(id, x, y) => {
        // Optimistic move (live drag)
        const snappedX = snapToGrid(x);
        const snappedY = snapToGrid(y);
        
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
      }}

      onCommitMove={(id, x, y) => {
        const snappedX = snapToGrid(x);
        const snappedY = snapToGrid(y);
      
        // Optimistically apply snapped pos
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, x: snappedX, y: snappedY } : c))
        );
      
        // Persist to server
        update.mutate({ id, x: snappedX, y: snappedY });
      }}
      render={({ card }) => <div>
        {selected?.id !== card.id && <View card={card} />}
        {selected && selected.id == card.id && (() => {
              const Editor = CARD_TYPES[selected.type]?.Editor;
              if (!Editor) return <p className="p-3 text-sm">No editor available</p>;

              // Editor reads/writes local buffer only (content-only)
              const editorCard = { ...selected, ...(editedFields[selected.id] ?? {}) };

              return (
                <Editor
                  card={editorCard}
                  onSave={(u: Partial<CardProps>) =>
                    setEditedFields((prev) => ({
                      ...prev,
                      [selected.id]: { ...prev[selected.id], ...pickEditable(u) },
                    }))
                  }
                  closeEditor={() => {setSelected(null)}}
                />
              );
            })()}
      </div>}
      defaultSize={{ width: 200, height: 0, widthFactor: 1.5 }}
      className={cn("border-0", selected?.id == card.id ? "z-100" : "")}                 // your extra styles
    />
  );
})}
        </div>

        {/* Zoom Controls */}
        <div
          className={cn(
            "absolute top-4 right-4 flex gap-2 p-2 rounded-xl backdrop-blur-md",
            colors.nav.background
          )}
        >
          <Button size="icon" variant="ghost" onClick={() => adjustZoom(-0.1)}>
            <Minus className="w-4 h-4" />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" onClick={resetZoom} className="px-6">
                {zoomDisplay}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex flex-row gap-1">
              <Undo2 size={16} />
              Reset zoom
            </TooltipContent>
          </Tooltip>

          <Button size="icon" variant="ghost" onClick={() => adjustZoom(0.1)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Editor */}
      {/* {selected && (
        <aside
          className="col-[3] row-[1] flex flex-col h-full border-l border-white/10 bg-white/90 shadow-lg z-50"
          style={{ gridArea: "editor" }}
        >
          <div className="p-3 border-b border-neutral-300">
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={editedFields[selected.id]?.title ?? selected.title ?? ""}
              onChange={(e) =>
                setEditedFields((prev) => ({
                  ...prev,
                  [selected.id]: { ...prev[selected.id], ...pickEditable({ title: e.target.value }) },
                }))
              }
              className="w-full border rounded p-1 text-sm"
            />
          </div>

          <div className="flex-1 overflow-auto p-2 thin-scrollbar">
            {(() => {
              const Editor = CARD_TYPES[selected.type]?.Editor;
              if (!Editor) return <p className="p-3 text-sm">No editor available</p>;

              // Editor reads/writes local buffer only (content-only)
              const editorCard = { ...selected, ...(editedFields[selected.id] ?? {}) };

              return (
                <Editor
                  card={editorCard}
                  onSave={(u: Partial<CardProps>) =>
                    setEditedFields((prev) => ({
                      ...prev,
                      [selected.id]: { ...prev[selected.id], ...pickEditable(u) },
                    }))
                  }
                />
              );
            })()}
          </div>
        </aside>
      )} */}
    </div>
  );
}
