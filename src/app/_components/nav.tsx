"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Logo from "public/lucide/logo";
import { useTheme } from "@/hooks/use-theme";
import { signIn, useSession } from "next-auth/react";
import Avatar from "./users/avatar";

export type NavLink = {
  label: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  key: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  children?: NavLink[];
};

type Props = {
  links: NavLink[];
};

export function ResponsiveNav({ links }: Props) {
  const pathname = usePathname();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(links.length);
  const session = useSession()

  React.useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const calculate = () => {
      if (!containerRef.current || !measureRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;

      let total = 0;
      let count = 0;
      const items = measureRef.current.querySelectorAll(".nav-item-test");
      items.forEach((el) => {
        const w = (el as HTMLElement).offsetWidth;
        total += w;
        if (total < containerWidth - 80) {
          count++;
        }
      });
      setVisibleCount(count);
    };

    const resizeObserver = new ResizeObserver(calculate);
    resizeObserver.observe(containerRef.current);

    window.addEventListener("resize", calculate);
    calculate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [links]);

  const visible = links.slice(0, visibleCount);
  const hidden = links.slice(visibleCount);

  const { colors } = useTheme()

  const router = useRouter()

  return (
    <div className="min-h-[var(--nav-height)] z-100">
      {/* Desktop */}
      <div className={"h-[var(--nav-height)] px-6 md:px-4 flex gap-4 items-center justify-between fixed z-10 top-0 left-0 right-0"}>

        <Logo onClick={() => router.push("/")} className="cursor-pointer text-primary hidden md:flex size-16 duration-700" />

        <div className="hidden md:flex items-center justify-between w-full" ref={containerRef}>
          <div className="bg-background rounded-lg px-1 duration-250 py-1 mx-auto flex items-center gap-1 overflow-hidden justify-between">

          {visible.map((link) => (
            <NavItem key={link.key} link={link} active={pathname === link.href} />
          ))}

            {hidden.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {hidden.map((link) => (
                    <DropdownMenuItem key={link.key} asChild>
                      <NavItem link={link} active={pathname === link.href} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Hidden measuring container (not visible) */}
        <div className="absolute invisible h-0 overflow-hidden" ref={measureRef}>
          {links.map((link) => (
            <NavItem key={link.key} link={link} active={false} />
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden text-primary">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="p-4 cursor-pointer text-primary bg-transparent hover:text-background" variant="default" size="icon">
                <Menu className="size-8" />
              </Button>
            </SheetTrigger>
            <SheetContent className={"p-4 border-primary/25 bg-background"} side="left">
              <div className="flex flex-col gap-2 mt-4">
                {links.map((link) => (
                  <NavItem className="hover:bg-primary/15 hover:text-primary" key={link.key} link={link} active={pathname === link.href} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Logo onClick={() => router.push("/")} className="cursor-pointer text-primary md:hidden size-16 duration-700" />
        
        {session?.status === "authenticated"
          ? <Link href={`/user/${session?.data?.user?.id}`} className="size-12 w-12 h-auto hover:outline-1 outline-primary/50 border-2 border-transparent rounded-full relative cursor-pointer opacity-90 hover:opacity-100">
              <Avatar className="size-auto bg-zinc-300" src={session?.data?.user?.image || "/svg/user/placeholder-avatar.svg"} />
            </Link>
          : <Button className="ml-auto bg-background text-primary hover:bg-primary hover:text-background" onClick={() => {signIn()}}>Sign in</Button>
        }
      </div>
    </div>
  );
}

function NavItem({ link, active, className }: { link: NavLink; active: boolean; className?: string }) {
  const {colors} = useTheme()
  const Icon = link.icon;

  const content = (
    <span
      className={cn(
        "group flex text-primary items-center hover:text-background hover:bg-primary bg-background duration-250 gap-2 px-3 py-2 rounded-md nav-item-test",
        className
      )}
      onClick={link.onClick}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {link.label}
      {link.badge && (
        <span className="ml-2 rounded-full group-hover:bg-background group-hover:text-primary bg-primary px-2 py-0.5 text-xs text-background">
          {link.badge}
        </span>
      )}
    </span>
  );

  if (link.href) {
    return (
      <Link href={link.href} className="no-underline">
        {content}
      </Link>
    );
  }
  return content;
}
