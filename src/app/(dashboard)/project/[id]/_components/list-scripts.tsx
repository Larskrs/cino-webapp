"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export function ScriptList ({ projectId } : { projectId: string }) {
  const [scripts] = api.scripts.list.useSuspenseQuery({projectId});

  if (!scripts.length) {
    return <p className="h-full text-lg mt-32 my-auto">This project has no scripts yet</p>;
  }

  return (
    <div className="w-full h-full px-4 max-w-5xl container grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {scripts.map((s) => (
        <Link
          href={`/script/${s.id}`}
          key={s.id}
          className="cursor-pointer aspect-[8.5/11] hover:outline-black/25 outline-2 outline-transparent rounded-lg bg-white/100 p-4 flex flex-col justify-end text-black transition"
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
