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
import Image from "next/image";
import ChangeProjectImage from "./_components/change-project-image";

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
      <main className="w-full flex min-h-screen flex-col items-center justify-start dark:bg-neutral-950">
        
        <header className="w-full overflow-hidden relative bg-gray-200 dark:bg-black">
          <div className="z-1 w-full py-6 px-4 max-w-7xl mx-auto grid grid-cols-7 w h-50 sm:h-60 md:h-80 lg:h-100 relative rounded-xl flex-wrap gap-2 items-center justify-center mb-4 mt-4">
            <div className="col-span-3">
              <h1 className="z-1 text-2xl md:text-4xl lg:text-6xl font-bold">{project.name}</h1>
            </div>
            <div className="col-span-4 h-full relative object-cover rounded-xl">
              {project.image && <Image className="absolute inset-0 w-full h-full object-cover rounded-xl" src={project.image ?? "https://cino.no/_next/image?url=%2Fapi%2Fv1%2Ffiles%3Ffid%3Duk8ndr7lx63j&w=750&q=75"} width={720} height={540} alt="project image" />}  
              <ChangeProjectImage projectId={projectId} currentImage={project?.image} >
                <Button className="absolute top-4 left-4" variant="outline" size="sm">
                  {project.image ? "Change" : "Add"} Image
                </Button>
              </ChangeProjectImage>
            </div>
          </div>
          {project.image && <Image className="hidden dark:block absolute blur-2xl opacity-50 z-0 inset-0 w-full h-full object-cover rounded-xl" src={project.image ?? "https://cino.no/_next/image?url=%2Fapi%2Fv1%2Ffiles%3Ffid%3Duk8ndr7lx63j&w=750&q=75"} width={720} height={540} alt="project image" />}
        </header>

        <div className="flex flex-col mt-4 gap-2 px-2 sm:px-8 w-full max-w-7xl">
          <div className="flex flex-row flex-wrap gap-2 items-center justify-start w-full max-w-7xl mb-4">
            <AddMemberDialog projectId={projectId} />
            <div className="flex -space-x-2">
              {project.members.map((user, i) => (
                <Avatar className="size-8 border-2" key={i} src={user.user.image} />
              ))}
            </div>
          </div>
          <ScriptList projectId={projectId} />

          <BoardList projectId={projectId} parentId={null} />
        </div>
      </main>
    </HydrateClient>
  );
}
