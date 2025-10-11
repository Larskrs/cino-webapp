// app/project/[id]/board/[boardId]/page.tsx
import { api } from "@/trpc/server";
import BoardClient from "./editor";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string; boardId: string }>;
}) {
  const { id: boardId } = await params;
  const board = await api.board.get({ id: boardId });
  const cards = await api.board.list_cards({ boardId });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="fixed -z-10 inset-0 h-screen w-screen 
        bg-[radial-gradient(circle,#73737340_1px,transparent_1px)] 
        bg-[size:10px_10px]" />

      <nav className="flex items-center justify-center bg-transparent w-full p-2 gap-2">
        <span
          className="size-2 rounded-full"
          style={{ background: board?.color || "gray" }}
        />
        <p>{board?.name}</p>
      </nav>

      <BoardClient board={board} initialCards={cards} />
    </div>
  );
}
