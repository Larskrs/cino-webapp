"use client"
import React from "react";
import Nav, { type NavLink } from "../_components/nav";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard } from "lucide-react";
import { EditorToolboxProvider } from "./script/[scriptId]/_hooks/useToolbox";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {



  const links: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/project/"},
    { label: "Support", href: "/support" }, // will go into More
  ];

  return (
    <>
        <Nav
          logo={<Link href="/" className="font-bold flex flex-row gap-2"><Clapperboard /> Cino.no</Link>}
          links={links}
          rightSlot={<Button asChild><Link href="/api/auth/signin">Sign in</Link></Button>}
          maxPrimaryLinks={6}
        />
        <EditorToolboxProvider>
          {children}
        </EditorToolboxProvider>
    </>
  );
}