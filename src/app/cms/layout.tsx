import { hasPermission } from "@/lib/permissions";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export default async function Layout({children}:{children: ReactNode}) {
  const session = await auth()

  if (!hasPermission(session?.user.id ?? "", "media.admin.read")) { return notFound()}

  return children
}