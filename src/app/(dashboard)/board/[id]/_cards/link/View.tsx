"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type LinkMetadata = {
  title?: string;
  description?: string;
  image?: string | null;
  icon?: string | null;
  url: string;
};

export default function LinkCardView({ card }: { card: any }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [meta, setMeta] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const dragMovedRef = useRef(false);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                              Fetch Metadata                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!card.content) return;

    const controller = new AbortController();

    const fetchMeta = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/metadata?url=${encodeURIComponent(card.content)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.title || data.description || data.image) {
          setMeta({
            url: card.content,
            title: data.title,
            description: data.description,
            image: data.image,
            icon: data.icon,
          });
        } else {
          setMeta({ url: card.content });
        }
      } catch (err) {
        console.warn("Failed to load metadata:", err);
        setMeta({ url: card.content });
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
    return () => controller.abort();
  }, [card.content]);

  /* -------------------------------------------------------------------------- */
  /*                           Pointer + Click Handlers                         */
  /* -------------------------------------------------------------------------- */

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerDownRef.current) return;
    const dx = Math.abs(e.clientX - pointerDownRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownRef.current.y);
    if (dx > 5 || dy > 5) dragMovedRef.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!meta?.url) return;

    const url = meta.url.trim();
    const isExternal = (() => {
      try {
        const u = new URL(url);
        return u.origin !== window.location.origin;
      } catch {
        return true;
      }
    })();

    // Ctrl-click = open in new tab
    if (e.ctrlKey || e.metaKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           Fallback & Loading States                        */
  /* -------------------------------------------------------------------------- */

  if (!card.content)
    return (
      <p
        className={cn(
          "text-lg whitespace-pre-wrap break-words p-4 italic opacity-60",
          colors.components.boards.card
        )}
      >
        Paste a link to preview...
      </p>
    );

  if (loading)
    return (
      <div
        className={cn(
          "p-4 text-sm text-muted-foreground italic animate-pulse",
          colors.components.boards.card
        )}
      >
        Fetching preview…
      </div>
    );

  if (!meta?.title && !meta?.description && !meta?.image)
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={cn(
          "block p-4 text-blue-600 underline break-words hover:text-blue-700 transition-colors cursor-pointer select-none",
          colors.components.boards.card
        )}
      >
        {card.content}
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /*                                    Render                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={cn(
              "flex flex-col select-none gap-4 items-center overflow-hidden shadow-sm transition hover:shadow-md cursor-pointer p-3",
              colors.components.boards.card
            )}
          >
            {meta.image && (
              <img
                src={meta.image}
                alt={meta.title || "preview"}
                className="w-full h-auto object-cover flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div className="flex flex-col gap-1 flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                {meta.icon && (
                  <img
                    src={meta.icon}
                    alt="favicon"
                    className="w-5 h-5 rounded-sm object-contain flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <h3 className="font-semibold text-lg line-clamp-1">{meta.title}</h3>
              </div>
              {meta.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {meta.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {new URL(meta.url).hostname}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="opacity-60">(Ctrl+Click to open)</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
