"use client";

import { api } from "@/trpc/react";
import Avatar from "../users/avatar";
import Link from "next/link";

export function ProjectList() {
  const [projects] = api.projects.list.useSuspenseQuery();

  if (!projects.length) {
    return <p>You don’t have access to any projects yet.</p>;
  }

  return (
    <div className="w-full max-w-5xl container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {projects.map((p) => (
        <Link
          href={`/project/${p.id}`}
          key={p.id}
          className="cursor-pointer hover:outline-black/25 outline-2 outline-transparent rounded-lg bg-white/100 p-4 text-black transition"
        >
          <p className="font-semibold">{p.name}</p>
          {p.description && (
            <p className="text-sm text-gray-700">{p.description}</p>
          )}

          <div className="mt-2 flex flex-row items-center justify-start gap-2 text-sm text-gray-500">
            <div className="flex flex-row items-center justify-start gap-2">
              <p>{p._count.files} Filer</p>
              <p>{p._count.scripts} Manus</p>
            </div>

            <div className="flex -space-x-2 ml-auto">
              {p.members.map((user, i) => (
                <Avatar className="size-6 outline-2 outline-white" key={i} src={user.user.image} />
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
