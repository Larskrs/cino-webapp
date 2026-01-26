"use server"

import { hasPermission } from "@/lib/permissions";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
export default async function Layout({children}:{children: ReactNode}) {
  const session = await auth()

  if (!hasPermission(session?.user.id ?? "", "media.admin.read")) { return notFound()}

  return <div className="grid grid-cols-[var(--sidebar-width)_1fr]">
    <nav className="top-0 left-0 right-0 w-full min-h-[var(--nav-height)] border-r bg-background">
      
    </nav>
    <main className="flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto left-0 right-0 top-[var(--nav-height)]">
      {children}
    </main>
  </div>
}