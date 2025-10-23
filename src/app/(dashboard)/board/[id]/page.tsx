"use client";

import { api } from "@/trpc/react";
import BoardClient from "./editor";
import type { CardProps } from "./_cards";
import React from "react";

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = React.use(params);

  const [board] = api.board.get.useSuspenseQuery({ id });
  const [cards] = api.board.list_cards.useSuspenseQuery({ boardId: id });

  const normalizedCards: CardProps[] = cards as CardProps[];

  return (
    <div className="fixed w-full max-h-screen overscroll-x-none h-[calc(100vh-4rem)] min-h-20 overflow-hidden">
      <BoardClient board={board} initialCards={normalizedCards} />
    </div>
  );
}
