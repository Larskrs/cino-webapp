"use client"
import React from "react";
import Nav, { type NavLink } from "../_components/nav";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeColors, type ThemeKey } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

export function ThemeSwitcher({
  theme,
  colors,
}: {
  theme: ThemeKey;
  colors: ThemeColors;
}) {
  return (
    <div
      className={cn(
        "relative flex h-7 w-16 px-0 items-center rounded-full",
        colors.components.dropdown.container
      )}
    >
      <motion.div
        animate={{ x: theme === "dark" ? 38 : 8 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full",
          colors.text
        )}
      >
        {theme === "dark" ? <Moon
          size={10} />
        : <Sun size={10} />}
      </motion.div>
    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const { theme, setTheme, colors } = useTheme()


  const links: NavLink[] = [
    { label: "Home", href: "/", key: "home" },
    { label: "Projects", href: "/project/", key: "projects"},
    { label: "Support", href: "/support", key: "support" }, // will go into More
    { label: (<ThemeSwitcher theme={theme} colors={colors}/>), key: "theme", onClick: () => setTheme(theme == "dark" ? "light" : "dark")}
  ];

  return (
    <div className={colors.background}>
        <Nav
          logo={<React.Fragment>
              {theme == "dark"
                ? <Link href="/" className="font-bold flex flex-row gap-2"><Image className="h-10 w-fit" alt="cino.no logo" src={"/svg/logo/CINO-WHITE.svg"} width={720} height={200} /></Link>
                : <Link href="/" className="invert font-bold flex flex-row gap-2"><Image className="h-10 w-fit" alt="cino.no logo" src={"/svg/logo/CINO-WHITE.svg"} width={720} height={200} /></Link>
              }
            </React.Fragment>}
          links={links}
          rightSlot={<Button asChild><Link href="/api/auth/signin">Sign in</Link></Button>}
          maxPrimaryLinks={6}
        />
          {children}
    </div>
  );
}