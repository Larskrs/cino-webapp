"use client";

import { api } from "@/trpc/react";
import Avatar from "../users/avatar";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";// adjust import path if needed
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PostList() {
  const [posts] = api.post.list.useSuspenseQuery();
  const { colors } = useTheme();

  if (!posts.length) {
    return (
      <div
        className={`flex w-full justify-center py-10 ${colors.textMuted}`}
      >
        Welp, no posts found...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl gap-0 flex flex-col divide-y">
      {posts.map((p) => {

        return (
          <Card
            key={p.id}
            className={cn(
              "flex items-start border-collapse border-b-0 gap-3 px-4 pt-3 pb-4 rounded-none",
              colors.background,
              colors.cardBorder
            )}
          >
            {/* Content */}
            <div className="flex flex-col flex-1 w-full">
              {/* Top row: author + timestamp */}
              <div className="flex flex-row gap-4">
                <Avatar
                  className="size-12 mt-1.5 shrink-0 rounded-full"
                  src={p.createdBy.image}
                />
                <div className="flex flex-col w-full">
                  <div
                    className={`flex items-center gap-2 text-lg ${colors.textMuted}`}
                  >
                    {/* Avatar */}
                    <span className={`font-semibold ${colors.text}`}>
                      {p.createdBy.name}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body text */}
                  <p className={`mt-1 text-lg leading-snug whitespace-pre-line break-words ${colors.text}`}>
                    {p.body}
                  </p>

                  {Array.isArray(p.attachments) && p.attachments.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      {p.attachments.map((att: any, i: number) => (
                        att.type === "image" ? (
                          <img
                            alt={att.title}
                            src={att.url}
                            key={i}
                            className="w-full h-auto bg-center bg-cover rounded-xl shadow-sm"
                            
                          />
                        ) : att.type === "video" ? (
                          <video
                            key={i}
                            controls
                            className="w-full max-h-80 rounded-xl shadow-sm border"
                            src={att.url}
                          />
                        ) : null
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
