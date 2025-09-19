"use client";

import { api } from "@/trpc/react";
import Avatar from "../users/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { CreateProjectDialog } from "./create-project";

const MAX_PROJECTS = 3; // 👈 set the limit

export function ProjectList() {
  const [projects] = api.projects.list.useSuspenseQuery();

  let fillerCount = Math.max(0, MAX_PROJECTS - projects.length);
  if (projects.length == 0) fillerCount = 3

  const { colors } = useTheme()

  return (
    <div className="w-full max-w-5xl container grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {projects.map((p) => (
        <Link
          href={`/project/${p.id}`}
          key={p.id}
          className={cn("relative min-h-30 cursor-pointer rounded-lg p-4 not-hover:border-transparent", colors.cardBackground, colors.cardBorder)}
        >
          <p className="font-semibold">{p.name}</p>
          {p.description && (
            <p className="text-sm text-gray-700">{p.description}</p>
          )}

          <div className="mt-auto flex flex-row absolute h-fit px-4 pb-3 inset-0 items-end justify-start gap-2 text-sm text-gray-500">
            <div className="flex flex-row items-center justify-start gap-2">
              <p>{p._count.files} Filer</p>
              <p>{p._count.scripts} Manus</p>
            </div>

            <div className="flex -space-x-2 ml-auto">
              {p.members.map((user, i) => (
                <Avatar className="size-6" key={i} src={user.user.image} />
              ))}
            </div>
          </div>
        </Link>
      ))}

      {Array.from({ length: fillerCount }).map((_, i) => (
        <CreateProjectDialog
          key={`filler-${i}`}
        >
          <Card
            className={cn(
              "min-h-30 rounded-lg p-4 bg-transparent cursor-pointer border-dashed opacity-75 text-center text-sm justify-center scale-100 hover:scale-102 hover:opacity-100 duration-200 transition-all",
              colors.cardBorder, "duration-100 transition-all"
            )}
            >
            <p className="text-center text-sm justify-center text-gray-500">Empty slot</p>
          </Card>
        </CreateProjectDialog>
      ))}
    </div>
  );
}
