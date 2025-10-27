"use client";

import { api } from "@/trpc/react";
import Avatar from "../users/avatar";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { CreateProjectDialog } from "./create-project";

const MAX_PROJECTS = 3;

export function ProjectList() {
  const [projects] = api.projects.list.useSuspenseQuery();

  let fillerCount = Math.max(0, MAX_PROJECTS - projects.length);
  if (projects.length === 0) fillerCount = 3;

  const { colors } = useTheme();

  return (
    <div className="w-full container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {projects.map((p) => (
        <Link
          href={`/project/${p.id}`}
          key={p.id}
          className={cn(
            "relative group flex flex-col overflow-hidden rounded-lg cursor-pointer not-hover:border-transparent",
            colors.cardBackground,
            colors.cardBorder
          )}
        >
          {/* Project image */}
          <div className="relative w-full aspect-[7/3] bg-gray-200 dark:bg-gray-800">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="select-none object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}
          </div>

          {/* Project content */}
          <div className="flex flex-col p-4 flex-1">
            <p className="font-semibold text-base">{p.name}</p>
            {p.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {p.description}
              </p>
            )}

            <div className="mt-auto flex flex-row items-end justify-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <p>{p._count.files} Files</p>
              <p>{p._count.scripts} Scripts</p>
              <p>{p._count.boards} Boards</p>

              <div className="flex -space-x-2 ml-auto">
                {p.members.map((user, i) => (
                  <Avatar className="size-6" key={i} src={user.user.image} />
                ))}
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* Empty slots */}
      {Array.from({ length: fillerCount }).map((_, i) => (
        <CreateProjectDialog key={`filler-${i}`}>
          <Card
            className={cn(
              "min-h-30 rounded-lg p-4 bg-transparent cursor-pointer border-dashed opacity-75 text-center text-sm justify-center scale-100 hover:scale-102 hover:opacity-100 transition-all duration-200",
              colors.cardBorder
            )}
          >
            <p className="text-center text-sm text-gray-500">Empty slot</p>
          </Card>
        </CreateProjectDialog>
      ))}
    </div>
  );
}
