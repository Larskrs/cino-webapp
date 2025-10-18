// app/project/[id]/board/[boardId]/page.tsx
import { api } from "@/trpc/server";
import BoardClient from "./editor";
import Link from "next/link";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string; boardId: string }>;
}) {
  const { id: boardId } = await params;
  const board = await api.board.get({ id: boardId });
  const cards = await api.board.list_cards({ boardId });

  return (
    <div className="fixed w-full max-h-screen overscroll-x-none h-[calc(100vh-4rem)] min-h-20 overflow-hidden">

      <nav className="fixed flex items-center justify-center bg-transparent w-full p-2 gap-2 z-100">
        <Link href={"/project/" + board?.projectId} className="hover:underline">
          {board?.project?.name}
        </Link>
        <span
          className="size-2 rounded-full"
          style={{ background: board?.color || "gray" }}
        />
        <p>{board?.name}</p>
      </nav>

      {cards && <BoardClient board={board} initialCards={cards as any} />}
    </div>
  );
}
