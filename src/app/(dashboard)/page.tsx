import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { ProjectList } from "../_components/projects/list-projects";
import { CreateProjectDialog } from "../_components/projects/create-project";

export default async function Home() {

  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
    void api.projects.list.prefetch()
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gray-200 dark:bg-gray-950 text-black dark:text-white">
        <div className="container flex flex-col items-center justify-start gap-4 px-4 pt-4">
         {session?.user && <div className="mx-auto flex flex-row items-start w-full max-w-5xl"><CreateProjectDialog /></div>}
         {session?.user && <ProjectList />}

         {/* <ScreenplayMarkdownEditor /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
