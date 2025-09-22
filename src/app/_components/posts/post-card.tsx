"use client";

import Avatar from "../users/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import Image from "next/image";
import Video from "../video";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { useState } from "react";
import { PostBody } from "./post-body";
import Link from "next/link";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Post = RouterOutputs["post"]["list"][number];

export function PostCard({ post }: { post: Post}) {
  const { colors } = useTheme();

  return (
    <Card
      key={post.id}
      className={cn(
        "flex max-w-2xl items-start gap-3 px-4 pt-3 pb-4 shadow-none border-none rounded-xl",
        colors.cardBackground,
      )}
    >
      <div className="flex flex-col flex-1 w-full">
        {/* Top row: author + timestamp */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-full">
            <div
              className={`flex items-center gap-2 text-lg ${colors.textMuted}`}
            >
              <Link href={`/user/${post.createdBy.id}`} className="hover:underline cursor-pointer flex items-center justify-center gap-3">
                <Avatar
                  className="size-6 shrink-0 rounded-full"
                  src={post.createdBy.image}
                  />
                <span className={`font-semibold ${colors.text}`}>
                  {post.createdBy.name}
                </span>
              </Link>
              <span>·</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <PostBody post={post} colors={colors} />

            {Array.isArray(post.attachments) && post.attachments.length > 0 && (
              <div
                className={cn(
                  "mt-3 flex flex-col gap-3 max-h-160 w-auto relative overflow-hidden rounded-xl"
                )}
              >
                {post.attachments.map((att: any, i: number) =>
                  att.type === "image" ? (
                    <Image
                      width={720}
                      height={720}
                      alt={att.alt}
                      src={att.url}
                      key={i}
                      className={cn("max-h-160 w-auto object-contain rounded-xl inset-0")}
                    />
                  ) : att.type === "video" ? (
                    <Video
                      autoPlayOnView
                      loop
                      key={i}
                      controls
                      className={cn("max-h-160 w-auto object-contain rounded-xl inset-0")}
                      src={att.url}
                    />
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
