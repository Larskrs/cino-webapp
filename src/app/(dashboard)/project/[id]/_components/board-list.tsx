"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import CreateBoardDialog from "./create-board-dialog"
import { FolderPlus, Folder, BookMarkedIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export function BoardList({ projectId, parentId }: { projectId: string; parentId?: string | null }) {
  const [boards] = api.board.list.useSuspenseQuery({ projectId, parentId });
  const { colors } = useTheme();

  return (
    <div className="w-full px-4 container max-w-5xl h-48 flex flex-row flex-wrap gap-2 py-6">
      {/* Create board button */}
      <CreateBoardDialog projectId={projectId} parentId={parentId}>
        <div
          className={cn(
            "cursor-pointer h-full aspect-square rounded-xl border border-neutral-700/30 hover:border-neutral-400 bg-neutral-900/80 hover:bg-neutral-800/80",
            "flex flex-col items-center justify-center gap-3 p-2 transition-colors text-neutral-300"
          )}
        >
          <FolderPlus size={64} className="stroke-[1.5]" />
          <p className="text-sm font-medium">New Board</p>
        </div>
      </CreateBoardDialog>

      {/* List existing boards */}
      {boards.map((b) => (
        <Link
          href={`/board/${b.id}`}
          key={b.id}
          className={cn(
            "cursor-pointer aspect-square rounded-xl border border-neutral-700/30 hover:border-neutral-400",
            "flex flex-col items-center justify-center p-4 aspect-square w-auto h-full"
          )}
        >
          <div
            className="p-2 rounded-2xl border-2 mb-1"
            style={{ backgroundColor: b.color ?? undefined, borderColor: b.color ?? undefined }}
          >
            <Folder size={42} className="stroke-[1.5] text-black" />
          </div>
          <p className="text-sm font-normal text-center">{b.name}</p>
          {b.cards.length > 0 && (
            <p className="text-xs text-neutral-500">{b.cards.length} cards</p>
          )}
        </Link>
      ))}
    </div>
  );
}
