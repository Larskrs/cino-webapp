import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { ProjectList } from "../_components/projects/list-projects";
import { CreateProjectDialog } from "../_components/projects/create-project";
import CreatePostDialog from "../_components/posts/create-post";
import { PostList } from "../_components/posts/list-posts";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export default async function Home() {

  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
    void api.projects.list.prefetch()
  }

    
  return (
    <HydrateClient>
      <main className={cn("flex min-h-screen flex-col items-center justify-start")}>
        <div className="max-w-2xl flex flex-col items-center justify-start gap-4 px-4 pt-4">
          <div className="max-w-2xl flex flex-col gap-2">

            {session?.user && <div className="mx-auto flex flex-row items-start w-full max-w-5xl"><CreateProjectDialog /></div>}
            {session?.user && <ProjectList />}
            {session?.user && <div className="mx-auto flex flex-row items-start w-full max-w-5xl"><CreatePostDialog /></div>}
            {session?.user && <PostList />}

          </div>
         {/* <ScreenplayMarkdownEditor /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
