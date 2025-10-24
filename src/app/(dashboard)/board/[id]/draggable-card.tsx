"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CardProps } from "./_cards";

/* -------------------------------------------------------------------------- */
/*                               Types & Defaults                             */
/* -------------------------------------------------------------------------- */

export type DraggableCardProps = {
  card: CardProps;
  zoom: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (card: CardProps, event: PointerEvent | MouseEvent) => void;
  onEdit?: (card: CardProps) => void;
  onMovePreview?: (id: string, x: number, y: number) => void;
  onCommitMove?: (id: string, x: number, y: number) => void;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
  className?: string;
  render: (args: { card: CardProps }) => React.ReactNode;
  defaultSize?: { width: number; height: number; widthFactor?: number };
  onContextMenu?: (card: CardProps, e: React.MouseEvent) => void;
};

const DEFAULT_SIZE = { width: 200, height: 80, widthFactor: 1.5 };

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function DraggableCard({
  card,
  zoom,
  selected = false,
  disabled = false,
  onSelect,
  onEdit,
  onMovePreview,
  onCommitMove,
  bounds,
  className,
  render,
  defaultSize = DEFAULT_SIZE,
  onContextMenu,
}: DraggableCardProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  const posRef = useRef<{ x: number; y: number }>({ x: card.x ?? 0, y: card.y ?? 0 });

  const dragRef = useRef<{
    active: boolean;
    startScreenX: number;
    startScreenY: number;
    startX: number;
    startY: number;
    moved: boolean;
    frame: number | null;
  } | null>(null);

  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const MOVE_THRESHOLD = 3;

  /* -------------------------------------------------------------------------- */
  /*                              Lifecycle & Effects                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (dragRef.current?.active) return;
    const nextX = card.x ?? 0;
    const nextY = card.y ?? 0;
    posRef.current = { x: nextX, y: nextY };
    applyTransform(nextX, nextY);
  }, [card.x, card.y]);

  useLayoutEffect(() => {
    const x = card.x ?? 0;
    const y = card.y ?? 0;
    posRef.current = { x, y };
    applyTransform(x, y);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                   Helpers                                 */
  /* -------------------------------------------------------------------------- */

  const applyTransform = (x: number, y: number) => {
    if (!elRef.current) return;
    elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const clampToBounds = (x: number, y: number) => {
    if (!bounds) return { x, y };
    const { minX, minY, maxX, maxY } = bounds;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  /* -------------------------------------------------------------------------- */
  /*                              Pointer Handlers                              */
  /* -------------------------------------------------------------------------- */

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      // 🧠 Allow links and inputs to behave normally
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      // 🧠 Skip dragging entirely when holding Ctrl or Cmd
      if (e.ctrlKey || e.metaKey) return;

      if (e.button !== 0) return;
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

      dragRef.current = {
        active: true,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startX: posRef.current.x,
        startY: posRef.current.y,
        moved: false,
        frame: null,
      };

      e.preventDefault();
    },
    [disabled]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const session = dragRef.current;
      if (!session?.active) return;

      const dz = zoomRef.current || 1;
      const dxScreen = e.clientX - session.startScreenX;
      const dyScreen = e.clientY - session.startScreenY;

      if (!session.moved) {
        if (Math.abs(dxScreen) < MOVE_THRESHOLD && Math.abs(dyScreen) < MOVE_THRESHOLD) return;
        session.moved = true;
        setGhost({ x: session.startX, y: session.startY });
      }

      const dxBoard = dxScreen / dz;
      const dyBoard = dyScreen / dz;
      const rawX = session.startX + dxBoard;
      const rawY = session.startY + dyBoard;
      const { x, y } = clampToBounds(rawX, rawY);

      posRef.current = { x, y };

      if (session.frame == null) {
        session.frame = requestAnimationFrame(() => {
          session.frame = null;
          applyTransform(posRef.current.x, posRef.current.y);
          onMovePreview?.(card.id, posRef.current.x, posRef.current.y);
          setGhost({ x: posRef.current.x, y: posRef.current.y });
        });
      }
    },
    [onMovePreview, card.id, bounds]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      const session = dragRef.current;
      if (!session) return;

      if (session.frame != null) {
        cancelAnimationFrame(session.frame);
        session.frame = null;
      }

      if ("pointerId" in e && e.currentTarget && (e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      }

      dragRef.current = null;

      // Single click
      if (!session.moved) {
        onSelect?.(card, e.nativeEvent as MouseEvent);
        return;
      }

      // Commit drag
      onCommitMove?.(card.id, posRef.current.x, posRef.current.y);
      setTimeout(() => setGhost(null), 100);
    },
    [onSelect, onCommitMove, card]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      endDrag(e);
    },
    [disabled, endDrag]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragRef.current = null;
      setGhost(null);
      const x = card.x ?? 0;
      const y = card.y ?? 0;
      posRef.current = { x, y };
      applyTransform(x, y);
      if ((e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      }
    },
    [card.x, card.y]
  );

  /* -------------------------------------------------------------------------- */
  /*                              Context & Double Click                        */
  /* -------------------------------------------------------------------------- */

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onContextMenu?.(card, e);
    },
    [disabled, onContextMenu, card]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      // Ignore Ctrl + double click (should still open links)
      if (e.ctrlKey || e.metaKey) return;
      onEdit?.(card);
    },
    [disabled, onEdit, card]
  );

  /* -------------------------------------------------------------------------- */
  /*                                    Render                                  */
  /* -------------------------------------------------------------------------- */

  const { width, height, widthFactor } = defaultSize;
  const w = (card.width ?? width) * (widthFactor ?? 1);
  const h = card.height ?? height;

  return (
    <div
      ref={elRef}
      className={cn(
        "absolute select-none rounded-0 border p-0 transition-opacity duration-100",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-blue-400",
        className
      )}
      style={{
        transform: `translate3d(${card.x ?? 0}px, ${card.y ?? 0}px, 0)`,
        opacity: 1,
        minWidth: w,
        minHeight: h,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {render({ card })}
    </div>
  );
}
