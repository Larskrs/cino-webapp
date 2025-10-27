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
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Post = RouterOutputs["post"]["list"][number];

export function PostCard({
  post,
  className,
  showRepliesUnder,
  onClick,
}: {
  showRepliesUnder?: boolean,
  post: Post;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { colors } = useTheme();
  const session = useSession();

  return (
    <div
      className="flex flex-col gap-2"
      key={post.id}
    >
      <PostCardPrimitive {...{post, className, onClick}} />

      {showRepliesUnder && post?._count?.replies > 0 && <div className="flex flex-col gap-2 border-l-2 border-neutral-200 dark:border-neutral-800 min-h-20 pl-6 mb-4">
        {post?.replies?.map((r: any) => {
          return (
            <PostCardPrimitive className="" key={r.id} post={r} {...{onClick}} />
          )
        })}
      </div>}
    </div>
  );
}

export function PostCardPrimitive ({
  post,
  className,
  onClick,
}: {
  post: Post;
} & React.HTMLAttributes<HTMLDivElement>) {

    const { colors } = useTheme();
    const session = useSession();

    return(
        <Card
        onClick={onClick}
        className={cn(
          "flex max-w-2xl items-start gap-3 px-4 pt-3 pb-4 shadow-none border-none rounded-xl cursor-pointer w-full",
          "bg-white dark:bg-neutral-950 border-1 border-white",
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
              {Array.isArray(post.attachments) && post.attachments.length > 0 && (
                <PostAttachments attachments={post.attachments} />
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
    )

}

function PostAttachments({ attachments }: { attachments: any[] }) {
  const [index, setIndex] = React.useState(0);
  const total = attachments.length;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1 < total ? prev + 1 : prev));
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  const forceSquare = total > 1;

  return (
    <div className="relative mt-3 w-full overflow-hidden rounded-xl">
      {/* Slides wrapper */}
      <div
        className="flex transition-transform duration-750 ease-in-out"
        style={{
          transform: `translateX(-${index * (100 / total)}%)`,
          width: `${total * 100}%`,
        }}
      >
        {attachments.map((att, i) => (
          <div
            key={i}
            className={cn(
              "flex-shrink-0 max-h-175 flex items-center justify-center",
              forceSquare ? "" : ""
            )}
            style={{
              width: `${100 / total}%`,
            }}
          >
            {att.type === "image" ? (
              <Image
                width={720}
                height={720}
                alt={att.alt}
                src={att.url}
                onClick={(e) => e.stopPropagation()}
                className={cn(
 
                  forceSquare
                    ? "w-full h-fit object-cover"
                    : "max-h-2xl max-w-full object-contain"
                )}
              />
            ) : att.type === "video" ? (
              <Video
                autoPlayOnView
                loop
                controls
                src={att.url}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "rounded-xl",
                  forceSquare
                    ? "w-full h-full object-cover aspect-square"
                    : "w-full h-fit object-contain"
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {total > 1 && (
        <>
          {index > 0 && (
            <Button
              type="button"
              onClick={prev}
              className="absolute size-12 top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
            >
              <ChevronLeft className="size-full" />
            </Button>
          )}
          {index < total - 1 && (
            <Button
              type="button"
              onClick={next}
              className="absolute size-12 top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
            >
              <ChevronRight className="size-full" />
            </Button>
          )}
        </>
      )}

      {/* Pagination dots */}
      {total > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i === index ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}



function ScrollArrow (dir: "left" | "right") {

}