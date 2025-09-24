"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";

export function PostBody({
  post,
  colors,
  onClick,
}: { post: any; colors: any } & React.HTMLAttributes<HTMLDivElement>) {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    }
  }, [post.body]);

  // Split text and highlight hashtags
  const renderTextWithHashtags = (text: string) => {
    const regex = /#[\wæøåÆØÅ]+/g; // supports hashtags with norwegian letters too
    const parts = text.split(regex);
    const matches = text.match(regex);
    const { colors } = useTheme()

    if (!matches) return text;

    const result: React.ReactNode[] = [];
    parts.forEach((part, i) => {
      result.push(<span key={`text-${i}`}>{part}</span>);
      if (matches[i]) {
        const tag = matches[i].slice(1); // remove #
        result.push(
          <Link
            key={`tag-${i}`}
            href={`/?h=${encodeURIComponent(tag)}`}
            className={cn("hover:underline font-semibold", colors.link)}
            onClick={(e) => e.stopPropagation()} // prevent triggering post open
          >
            {matches[i]}
          </Link>
        );
      }
    });
    return result;
  };

  return (
    <div>
      {/* Body text */}
      <p
        onClick={onClick}
        ref={textRef}
        className={cn(
          `mt-1 text-lg leading-snug whitespace-pre-line break-words ${colors.text}`,
          showMore ? "line-clamp-none" : "line-clamp-2"
        )}
      >
        {renderTextWithHashtags(post.body)}
      </p>

      {isOverflowing && (
        <p
          className={cn("cursor-pointer mt-2", colors.text)}
          onClick={(e) => {
            e.stopPropagation();
            setShowMore((s) => !s);
          }}
        >
          Show {showMore ? "less" : "more"}...
        </p>
      )}
    </div>
  );
}
