// app/project/[id]/page.tsx
import Link from "next/link";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Avatar from "@/app/_components/users/avatar";
import { Button } from "@/components/ui/button";
import AddMemberDialog from "./_components/add-member-dialog";
import { ScriptList } from "./_components/list-scripts";
import { CreateScriptDialog } from "./_components/create-script-dialog";
import { notFound, redirect } from "next/navigation";
import { BoardList } from "./_components/board-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const projectId = (await params).id;

  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/"); // send them back to homepage
  }

  // Prefetch project
  const project = await api.projects.get({ projectId });

  if (!project) {
    return notFound();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-start">
        
        <div className="flex flex-row flex-wrap gap-2 items-center justify-start w-full max-w-5xl px-4 mb-4 mt-4">
            <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>

        <div className="flex flex-row flex-wrap gap-2 items-center justify-start w-full max-w-5xl px-4 mb-4">
          <AddMemberDialog projectId={projectId} />
        </div>
        <ScriptList projectId={projectId} />

        <BoardList projectId={projectId} parentId={null} />
      </main>
    </HydrateClient>
  );
}
