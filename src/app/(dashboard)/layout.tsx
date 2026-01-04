"use client"
import React, { useEffect, useState } from "react";
import { ResponsiveNav, type NavLink } from "../_components/nav";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Blocks, Edit, Home, Info, MessagesSquareIcon, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeColors, type ThemeKey } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Logo from "public/lucide/logo";
import TrendingTags from "../_components/posts/trending-tags";
import { usePostPreview } from "@/hooks/post-preview";
import PostPreviewDisplay from "../_components/posts/post-preview-display";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";

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
        colors.components.switch.container
      )}
    >
      <motion.div
        animate={{ x: theme === "dark" ? 38 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "flex h-5 w-5 text-white items-center justify-center rounded-full",
          colors.text,
          colors.buttonBackground
        )}
      >
        {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { theme, setTheme, colors } = useTheme();
  const pathname = usePathname()
  const [loading, setLoading] = useState(true);

  const isMediaPage =
    pathname === "/" ||
    pathname.startsWith("/serie/") ||
    pathname.startsWith("/film/");

  const session = useSession()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100); // show loader for 1.5s
    return () => clearTimeout(timer);
  }, []);

const links: NavLink[] = [
  { icon: Home, label: "Home", href: "/", key: "home" },
  { icon: MessagesSquareIcon, label: "Forum", href: "/p", key: "forum" },
  { icon: Blocks, label: "Projects", badge: "beta", href: "/project/", key: "projects" },

  ...(!isMediaPage
    ? [{ label: <ThemeSwitcher theme={theme} colors={colors} />, key: "theme", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), }]
    : []),

  ...((isMediaPage && hasPermission(session?.data?.user?.id ?? "", "media.admin.write"))
    ? [{ label: "CMS", key: "cms", icon: Edit, href: "/cms/"+(pathname.split("/")?.[2] ?? "")}]
    : []
  )
];

  const { post, setPost } = usePostPreview()

  return (
    <div className="bg-background">
      <ResponsiveNav links={links} />

      {post && <PostPreviewDisplay />}

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut"}}
            className={"fixed inset-0 z-50 flex flex-col items-center justify-center text-primary bg-background"}
          >
            <motion.div
              className="mb-4"
              initial={{ scale: 3, opacity: 0}}
              animate={{ scale: 1, opacity: [0, 0, 1] }}
              transition={{ duration: 2, ease: "anticipate" }}
            >
              <Logo className="size-full" /> {/* Replace <Home /> with your desired Lucide icon */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
      {!loading && children}
      </main>
    </div>
  );
}
