"use client";

import Avatar from "../users/avatar";
import { Card } from "@/components/ui/card";
import { cn, timeAgo } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import Image from "next/image";
import Video from "../video";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import React from "react";
import { PostBody } from "./post-body";
import Link from "next/link";
import CreatePostDialog from "./create-post";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Post = RouterOutputs["post"]["list"][number];

export function PostCard({
  post,
  className,
  onClick,
}: {
  post: Post;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { colors } = useTheme();
  const session = useSession();

  return (
    <Card
      key={post.id}
      onClick={onClick}
      className={cn(
        "flex max-w-2xl items-start gap-3 px-4 pt-3 pb-4 shadow-none border-none rounded-xl cursor-pointer w-full",
        colors.cardBackground,
        className
      )}
    >
      <div className="flex flex-col flex-1 w-full min-w-full">
        {/* Top row: author + timestamp */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-full">
            <div
              className={`flex items-center gap-2 text-lg ${colors.textMuted}`}
            >
              {/* Author profile link */}
              <Link
                href={`/user/${post.createdBy.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline cursor-pointer flex items-center justify-center gap-3"
              >
                <Avatar
                  className="size-6 shrink-0 rounded-full"
                  src={post.createdBy.image}
                />
                <span className={`font-semibold ${colors.text}`}>
                  {post.createdBy.name}
                </span>
              </Link>
              <span>·</span>
              <span>{timeAgo(new Date(post.createdAt), "no")}</span>
            </div>

            {/* Clicking post body should open post */}
            <PostBody onClick={onClick} post={post} colors={colors} />

            {/* Attachments */}
            {Array.isArray(post.attachments) &&
              post.attachments.length > 0 && (
                <div
                  className={cn(
                    "mt-3 flex flex-col gap-3 max-h-160 w-auto relative overflow-hidden rounded-xl"
                  )}
                  onClick={(e) => e.stopPropagation()} // prevent attachment clicks from bubbling
                >
                  {post.attachments.map((att: any, i: number) =>
                    att.type === "image" ? (
                      <Image
                        width={720}
                        height={720}
                        alt={att.alt}
                        src={att.url}
                        key={i}
                        className={cn(
                          "max-h-160 mx-auto w-fit object-contain rounded-xl inset-0"
                        )}
                      />
                    ) : att.type === "video" ? (
                      <Video
                        autoPlayOnView
                        loop
                        key={i}
                        controls
                        className={cn(
                          "max-h-160 mx-auto w-fit object-contain rounded-xl inset-0"
                        )}
                        src={att.url}
                      />
                    ) : null
                  )}
                </div>
              )}

            {/* Reply button */}
            {!post.parentId && (
              <CreatePostDialog
                session={session.data}
                parentId={post.id}
                onClick={(e: any) => e.stopPropagation()}
              >
                <div
                  className={cn(
                    "mt-2 flex gap-2 p-0 text-sm items-center",
                    colors.text
                  )}
                >
                  <MessageCircle strokeWidth={2} size={16} />
                  <p className="text-md">
                    {post?._count?.replies && post._count.replies > 0
                      ? post._count.replies
                      : ""}
                  </p>
                </div>
              </CreatePostDialog>
            )}

            {/* Extra dialog trigger */}
            <div onClick={(e) => e.stopPropagation()}>
              <CreatePostDialog session={session.data} parentId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
