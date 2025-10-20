"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Brush, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardEditorProps } from "../index";
import { api } from "@/trpc/react";

type PathData = {
  id: string;
  d: string;
  color: string;
  width: number;
};

export default function DrawingCardEditor({ card, onSave }: CardEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [paths, setPaths] = useState<PathData[]>(() => {
    try {
      return card.content ? JSON.parse(card.content).paths ?? [] : [];
    } catch {
      return [];
    }
  });
  const [currentPath, setCurrentPath] = useState<PathData | null>(null);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const update = api.board.update_card.useMutation();

  // --- Coordinate helper ---
  const getPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // --- Begin drawing ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEraser) {
      eraseAt(e);
      return;
    }
    const { x, y } = getPoint(e);
    const id = crypto.randomUUID();
    const newPath: PathData = {
      id,
      color,
      width,
      d: `M${x},${y}`,
    };
    setCurrentPath(newPath);
    setIsDrawing(true);
  };

  // --- Draw line ---
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isEraser) {
      eraseAt(e);
      return;
    }
    if (!isDrawing || !currentPath) return;
    const { x, y } = getPoint(e);
    setCurrentPath((p) => (p ? { ...p, d: p.d + ` L${x},${y}` } : p));
  };

  const handlePointerUp = () => {
    if (currentPath) setPaths((prev) => [...prev, currentPath]);
    setIsDrawing(false);
    setCurrentPath(null);
  };

  useEffect(() => {
        handleSave()
  }, [paths])

  // --- Erasing logic (hit detection on paths) ---
  const eraseAt = (e: React.PointerEvent) => {
    const { x, y } = getPoint(e);
    const threshold = 6; // distance tolerance
    setPaths((prev) =>
      prev.filter((path) => {
        const svg = svgRef.current;
        if (!svg) return true;
        const temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        temp.setAttribute("d", path.d);
        const len = temp.getTotalLength();
        for (let i = 0; i < len; i += 4) {
          const pt = temp.getPointAtLength(i);
          const dx = pt.x - x;
          const dy = pt.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < threshold) return false; // erase this path
        }
        return true;
      })
    );
  };

  const handleClear = () => setPaths([]);

  const handleSave = () => {
    const data = { paths };
    const content = JSON.stringify(data);
    onSave({ content });
  };

  // --- Re-render when drawing ---
  useEffect(() => {
    if (!isDrawing) return;
  }, [currentPath]);

  return (
    <div className="flex flex-col gap-3 w-full p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded border"
            disabled={isEraser}
          />
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            disabled={isEraser}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isEraser ? "default" : "secondary"}
            onClick={() => setIsEraser((p) => !p)}
            className={cn(
              "flex items-center gap-1 text-xs",
              isEraser
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-neutral-100 hover:bg-neutral-200"
            )}
          >
            <Eraser size={14} />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleClear}
            className="text-xs bg-neutral-100 hover:bg-neutral-200"
          >
            <Brush size={14} /> Clear
          </Button>

          {/* <Button
            size="sm"
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white hover:bg-blue-600"
          >
            <Save size={14} /> Save
          </Button> */}
        </div>
      </div>

      <div className="relative w-[400px] h-[300px] bg-white border border-neutral-300 rounded-md overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath && (
            <path
              d={currentPath.d}
              stroke={currentPath.color}
              strokeWidth={currentPath.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
