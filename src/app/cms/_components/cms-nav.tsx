"use client"

import { ResponsiveNav } from "@/app/_components/nav"
import { Home, LayoutDashboard } from "lucide-react"

export default function AdminNav ({}) {
  return (
        <ResponsiveNav
      links={[
        {
          key: "home",
          label: "Forsiden",
          icon: Home,
        },
        {
          key: "dashboard",
          label: "CMS",
          icon: LayoutDashboard,
        }
      ]}
    />
  )
}