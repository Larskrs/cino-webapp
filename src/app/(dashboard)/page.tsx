"use client"

import { ProjectList } from "../_components/projects/list-projects";
import { CreateProjectDialog } from "../_components/projects/create-project";
import CreatePostDialog from "../_components/posts/create-post";
import { PostList } from "../_components/posts/list-posts";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import Avatar from "../_components/users/avatar";

export default function Home() {

  const session = useSession()
  const { colors } = useTheme()

  return (
      <main className={cn("flex min-h-screen flex-col items-center justify-start")}>
        <div className="max-w-3xl flex flex-col items-center justify-start gap-4 px-4 pt-4">
          <div className="max-w-3xl flex flex-col gap-2">
            {/* {session?.data?.user && <ProjectList />} */}
            <PostList />

          </div>
         {/* <ScreenplayMarkdownEditor /> */}
        </div>
      </main>
  );
}
