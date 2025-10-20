"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CardProps } from "./_cards";

/**
 * Props for a single draggable card that lives inside your scaled "canvas".
 * Parent is responsible for storing card position (x,y) and passing the current zoom.
 */
export type DraggableCardProps = {
  card: CardProps;

  /** Current zoom/scale of the board (1 = 100%). */
  zoom: number;

  /** Whether this card is selected (for styling/interaction). */
  selected?: boolean;

  /** Disable dragging (e.g., when editing in the side panel). */
  disabled?: boolean;

  /** Called when the user clicks/selects the card (i.e., no drag happened). */
  onSelect?: (card: CardProps, event: PointerEvent | MouseEvent) => void;

  /**
   * Called continuously while dragging (throttled by rAF).
   * Useful for optimistic preview; parent can update the card list immediately.
   */
  onMovePreview?: (id: string, x: number, y: number) => void;

  /**
   * Called once on pointer up *if* the card actually moved.
   * Use this to persist the new position (tRPC update/mutation).
   */
  onCommitMove?: (id: string, x: number, y: number) => void;

  /**
   * Optional bounds the card is allowed to move within (in board units, not pixels).
   * If omitted, no clamping is performed.
   */
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };

  /** Optional className to extend styling */
  className?: string;

  /**
   * Render the inner card view. You’ll typically pass:
   *   ({ card }) => <CARD_TYPES[card.type].View card={card} />
   */
  render: (args: { card: CardProps }) => React.ReactNode;

  /**
   * Optional width/height fallback if card lacks them.
   * These should match whatever your card layout expects.
   */
  defaultSize?: { width: number; height: number; widthFactor?: number };
};

const DEFAULT_SIZE = { width: 200, height: 120, widthFactor: 1.5 };

/**
 * A zoom-aware, pointer-captured, rAF-driven draggable card.
 * - Uses CSS transform translate3d for buttery perf.
 * - Converts screen deltas -> board coords via current `zoom`.
 * - Stable even when zoom changes mid-drag (uses latest zoom live).
 * - Distinguishes click vs. drag via a small threshold.
 */
export default function DraggableCard({
  card,
  zoom,
  selected = false,
  disabled = false,
  onSelect,
  onMovePreview,
  onCommitMove,
  bounds,
  className,
  render,
  defaultSize = DEFAULT_SIZE,
}: DraggableCardProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  // Keep live mirrors of important values (avoid stale closures).
  const zoomRef = useRef(zoom);
  const posRef = useRef<{ x: number; y: number }>({ x: card.x ?? 0, y: card.y ?? 0 });

  // Drag session data (only valid during an active pointer drag).
  const dragRef = useRef<{
    active: boolean;
    startScreenX: number;
    startScreenY: number;
    startX: number;
    startY: number;
    moved: boolean;
    frame: number | null;
  } | null>(null);

  // Click-vs-drag threshold (in screen pixels).
  const MOVE_THRESHOLD = 3;

  // Keep refs in sync with props
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // If the parent updates x/y externally (e.g., from a server echo), sync immediately when *not* dragging.
  useEffect(() => {
    if (dragRef.current?.active) return; // don’t fight an ongoing drag
    const nextX = card.x ?? 0;
    const nextY = card.y ?? 0;
    posRef.current = { x: nextX, y: nextY };
    applyTransform(nextX, nextY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.x, card.y]);

  // Apply transform to the element (rAF-safe)
  const applyTransform = (x: number, y: number) => {
    if (!elRef.current) return;
    // Use translate3d for GPU acceleration
    elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  // Clamp helper (board units)
  const clampToBounds = (x: number, y: number) => {
    if (!bounds) return { x, y };
    const { minX, minY, maxX, maxY } = bounds;
    // Optionally clamp by card size if needed. For now, clamp by point:
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  // On mount (and whenever card position changes), draw once for initial layout.
  useLayoutEffect(() => {
    const x = card.x ?? 0;
    const y = card.y ?? 0;
    posRef.current = { x, y };
    applyTransform(x, y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    // Avoid starting a drag when initiating from inputs/contentEditable
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }

    // Left button only
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

    // Prevent text selection start
    e.preventDefault();
  }, [disabled]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragRef.current;
    if (!session?.active) return;

    const dz = zoomRef.current || 1;
    const dxScreen = e.clientX - session.startScreenX;
    const dyScreen = e.clientY - session.startScreenY;

    // If we haven’t exceeded threshold yet, check it now
    if (!session.moved) {
      if (Math.abs(dxScreen) < MOVE_THRESHOLD && Math.abs(dyScreen) < MOVE_THRESHOLD) {
        return; // still a click, don’t mark moved yet
      }
      session.moved = true;
    }

    // Convert screen deltas to board units using current zoom.
    const dxBoard = dxScreen / dz;
    const dyBoard = dyScreen / dz;
    const rawX = session.startX + dxBoard;
    const rawY = session.startY + dyBoard;
    const { x, y } = clampToBounds(rawX, rawY);

    // Store current position
    posRef.current = { x, y };

    // rAF update to DOM
    if (session.frame == null) {
      session.frame = requestAnimationFrame(() => {
        session.frame = null;
        applyTransform(posRef.current.x, posRef.current.y);
        onMovePreview?.(card.id, posRef.current.x, posRef.current.y);
      });
    }
  }, [onMovePreview, card.id, bounds]);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      const session = dragRef.current;
      if (!session) return;

      // Clear any pending rAF
      if (session.frame != null) {
        cancelAnimationFrame(session.frame);
        session.frame = null;
      }

      // Release capture if pointer event
      if ("pointerId" in e && e.currentTarget && (e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      }

      dragRef.current = null;

      // Click (no move): select
      if (!session.moved) {
        onSelect?.(card, (e.nativeEvent as any) as MouseEvent);
        return;
      }

      // Dragged: commit final position
      onCommitMove?.(card.id, posRef.current.x, posRef.current.y);
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
      // Cancel drag (no commit)
      const session = dragRef.current;
      if (!session) return;
      if (session.frame != null) {
        cancelAnimationFrame(session.frame);
        session.frame = null;
      }
      dragRef.current = null;

      // Snap back to last known persisted pos (from props)
      const x = card.x ?? 0;
      const y = card.y ?? 0;
      posRef.current = { x, y };
      applyTransform(x, y);

      // Release capture
      if ((e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      }
    },
    [card.x, card.y]
  );

  const { width, height, widthFactor } = defaultSize;
  const w = (card.width ?? width) * (widthFactor ?? 1);
  const h = card.height ?? height;

  return (
    <div
      ref={elRef}
      // Absolutely position in the board canvas; transform handles the (x,y)
      className={cn(
        "absolute select-none rounded-0 border p-0",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-blue-400",
        className
      )}
      style={{
        // We set transform via JS for performance; starting transform here is optional:
        transform: `translate3d(${card.x ?? 0}px, ${card.y ?? 0}px, 0)`,
        minWidth: w,
        minHeight: h,
        // Enable fast compositing
        willChange: "transform",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {render({ card })}
    </div>
  );
}
