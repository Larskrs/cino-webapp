"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import CreateBoardDialog from "./create-board-dialog"
import { FolderPlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export function BoardList({ projectId, parentId }: { projectId: string; parentId?: string | null }) {
  const [boards] = api.board.list.useSuspenseQuery({ projectId, parentId });
  const { colors } = useTheme();

  return (
    <div className="w-full px-4 container max-w-5xl h-48 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 py-6">
      {/* Create board button */}
      <CreateBoardDialog projectId={projectId} parentId={parentId}>
        <div
          className={cn(
            "cursor-pointer aspect-square rounded-xl border border-neutral-700/30 hover:border-neutral-400 bg-neutral-900/80 hover:bg-neutral-800/80",
            "flex flex-col items-center justify-center gap-3 transition-colors text-neutral-300"
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
            "cursor-pointer aspect-square rounded-xl border border-neutral-700/30 hover:border-neutral-400 bg-neutral-900/80 hover:bg-neutral-800/80",
            "flex flex-col items-center justify-center gap-3 text-neutral-200 transition-all aspect-square w-auto"
          )}
          style={{ backgroundColor: b.color ?? undefined }}
        >
          <Folder size={42} className="stroke-[1.5]" />
          <p className="text-sm font-semibold text-center">{b.name}</p>
          {b.cards.length > 0 && (
            <p className="text-xs text-neutral-200">{b.cards.length} cards</p>
          )}
        </Link>
      ))}
    </div>
  );
}
