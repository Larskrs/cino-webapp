"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PostBody({ post, colors }: { post: any; colors: any }) {
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
    <div>
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
          className="cursor-pointer mt-2"
          onClick={() => setShowMore((s) => !s)}
        >
          Show {showMore ? "less" : "more"}...
        </p>
      )}
    </div>
  );
}
