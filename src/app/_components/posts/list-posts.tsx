"use client";

import { api } from "@/trpc/react";
import { useTheme } from "@/hooks/use-theme";
import { PostCard } from "./post-card";
import { useSearchParams, useRouter } from "next/navigation";
import CreatePostDialog from "./create-post";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Avatar from "../users/avatar";

type PageProps = {
  userId?: string;
};

export function PostList({ userId }: PageProps) {
  const { colors } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get("p");
  const hashtag = searchParams.get("h"); // single hashtag filter

  // Build hashtags array if query param exists
  const hashtagsArray = hashtag ? [hashtag.toLowerCase()] : undefined;

  // Normal feed
  const [posts] = api.post.list.useSuspenseQuery({ userId, hashtags: hashtagsArray });

  // If deep-linked to one post → fetch it and its replies
  const [singlePost] = api.post.byId.useSuspenseQuery(
    { id: parseInt(postId || "0")! },
  );
  const [replies] = api.post.replies.useSuspenseQuery(
    { postId: parseInt(postId || "0")! },
  );

  if (postId && singlePost) {
    return (
      <div className="mx-auto w-full mt-2 max-w-3xl flex flex-col gap-2">
        <PostCard key={singlePost.id} post={singlePost as any} />
        <div className="border-none flex flex-col gap-2">
          {replies.map((r) => (
            <PostCard key={r.id} post={{...r as any}} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto gap-2 flex flex-col">
      <CreatePost />

      {posts?.map((p) => (
        <PostCard
          key={p.id}
          post={p as any}
          onClick={() => router.push(`?p=${p.id}`)} // navigate into single view
        />
      ))}
    </div>
  );
}

function CreatePost ({parentId}:{parentId?: number | undefined}) {
  const session = useSession()
  const {colors} = useTheme()

  return (
    <CreatePostDialog session={session.data} parentId={parentId} >
      <Card
        className={cn(
          "flex items-start gap-3 mb-8 mt-4 px-4 pt-3 pb-4 shadow-none border-none rounded-xl",
          colors.cardBackground,
        )}
      >
        <div className="flex flex-col flex-1 w-full">
          <div className="flex flex-row gap-4">
            <Avatar
              className="size-12 mt-1.5 shrink-0 rounded-full"
              src={session?.data?.user?.image || ""}
            />
            <div className="flex flex-col w-full">
              <div className={`flex items-center gap-2 text-lg ${colors.textMuted}`}>
                <span className={`font-semibold ${colors.text}`}>
                  {session?.data?.user.name}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 px-4 py-3 text-lg leading-snug whitespace-pre-line break-words cursor-pointer rounded-md",
                  colors.textMuted,
                  colors.buttonBackground,
                  colors.cardBorder
                )}
              >
                Hva vil du dele i dag?
              </p>
            </div>  
          </div>
        </div>
      </Card>
    </CreatePostDialog>
  )
}
