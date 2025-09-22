"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PostBody({ post, colors, onClick }: { post: any; colors: any } & React.HTMLAttributes<HTMLDivElement>) {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      // Compare scroll height with client height
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    }
  }, [post.body]);

  return (
    <div onClick={onClick}>
      {/* Body text */}
      <p
        ref={textRef}
        className={cn(
          `mt-1 text-lg leading-snug whitespace-pre-line break-all ${colors.text}`,
          showMore ? "line-clamp-none" : "line-clamp-2"
        )}
      >
        <span>{post.body}</span>
      </p>

      {isOverflowing && (
        <p
          className={cn("cursor-pointer mt-2", colors.text)}
          onClick={() => setShowMore((s) => !s)}
        >
          Show {showMore ? "less" : "more"}...
        </p>
      )}
    </div>
  );
}
