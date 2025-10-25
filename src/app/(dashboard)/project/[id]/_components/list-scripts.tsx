"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { CreateScriptDialog } from "./create-script-dialog";
import { File } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ScriptList ({ projectId } : { projectId: string }) {
  const [scripts] = api.scripts.list.useSuspenseQuery({projectId});

  const { colors } = useTheme();

  return (
    <div className="w-full h-60 flex flex-row flex-wrap gap-2">
      <CreateScriptDialog className="h-full" projectId={projectId} >
        <div
          className={cn("cursor-pointer aspect-[8.5/11] outline-black/10 hover:outline-black/50 outline-1 rounded-lg p-4 flex flex-col transition items-center justify-center gap-4",
            colors.components.boards.card
          )}
        >
          <File size={64} className="text-neutral-500 stroke-1" />
          <p>Create new script</p>
        </div>
      </CreateScriptDialog>
      {scripts.map((s) => (
        <Link
          href={`/script/${s.id}`}
          key={s.id}
          className={cn("cursor-pointer h-full aspect-[8.5/11] hover:outline-black/25 outline-1 outline-transparent rounded-lg bg-white/100 p-4 flex flex-col justify-end text-neutral-800 dark:text-neutral-300 transition",
            colors.components.boards.card
          )}
        >
          <p className="font-semibold">{s.title}</p>

          <div className="mt-2 flex flex-row items-center justify-start gap-2 text-sm text-gray-500">
            <div className="flex flex-row items-center justify-start gap-2">
              <p>{s._count.versions} Versions</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
