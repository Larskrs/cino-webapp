"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import CreateBoardDialog from "./create-board-dialog"
import { FolderPlus, Folder, BookMarkedIcon, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BoardList({ projectId, parentId }: { projectId: string; parentId?: string | null }) {
  const [boards] = api.board.list.useSuspenseQuery({ projectId, parentId });
  const { colors } = useTheme();

  return (
    <div className="w-full h-36 flex flex-row flex-wrap gap-2 py-0">
      {/* Create board button */}
      <CreateBoardDialog projectId={projectId} parentId={parentId}>
        <div
          className={cn("cursor-pointer aspect-square h-full outline-black/10 hover:outline-black/50 outline-1 rounded-lg p-4 flex flex-col transition items-center justify-center gap-4",
            colors.components.boards.card
          )}
        >
          <FolderPlus size={64} className="text-neutral-500 stroke-1" />
          <p className="text-sm font-medium">New Board</p>
        </div>
      </CreateBoardDialog>

      {/* List existing boards */}
      {boards.map((b) => (
        <div className="relative aspect-square w-auto h-full" key={b.id}>
            <Dialog>
              <DialogTrigger className="rounded-sm absolute z-1 top-0 right-0 translate-x-1/2 -translate-y-1/2 p-2 bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 cursor-pointer">
                <Trash className="" />
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Are you sure you about that?</DialogTitle>
                <DialogDescription>Are you sure you wish to delete this board forever? This action can not be undone.</DialogDescription>
                <DialogClose>Cancel</DialogClose>
                <Button variant={"destructive"}>Delete Board</Button>
              </DialogContent>
            </Dialog>
        <Link
          href={`/board/${b.id}`}
          key={b.id}
          className={cn(
            "relative cursor-pointer rounded-xl border border-neutral-700/10 dark:border-neutral-900 hover:border-neutral-400",
            "flex flex-col items-center justify-center p-4 aspect-square w-auto h-full",
            "text-neutral-800 dark:text-neutral-400",
            "hover:bg-neutral-200 dark:hover:bg-neutral-800",
            "dark:bg-neutral-900"
          )}
        >
          <div
            className="p-2 rounded-2xl border-2 mb-1 border-neutral-200 dark:border-neutral-800"
            style={{ backgroundColor: b.color ?? undefined }}
          >
            <Folder size={42} className="stroke-[1.5] text-neutral-800 dark:text-neutral-900" />
          </div>
          <p className="text-sm font-normal text-center text-neutral-800 dark:text-neutral-300">{b.name}</p>
          {b.cards.length > 0 && (
            <p className="text-xs text-neutral-500">{b.cards.length} cards</p>
          )}
        </Link>
        </div>
      ))}
    </div>
  );
}
