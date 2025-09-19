"use client";

import { api } from "@/trpc/react";
import { useTheme } from "@/hooks/use-theme";
import { PostCard } from "./post-card";

export function PostList() {
  const [posts] = api.post.list.useSuspenseQuery();
  const { colors } = useTheme();

  if (!posts.length) {
    return (
      <div className={`flex w-full justify-center py-10 ${colors.textMuted}`}>
        Welp, no posts found...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl gap-2 flex flex-col divide-y">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
