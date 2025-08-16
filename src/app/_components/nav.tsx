"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------------------------------------------
// Types
// ---------------------------------------------
export type NavLink = {
  label: string;
  href?: string;
  badge?: string;
  children?: NavLink[]; // nested groups / mega menu style
};

export type NavProps = {
  logo?: React.ReactNode;
  links: NavLink[];
  /** How many items to keep visible on desktop before moving the rest into “More”. */
  maxPrimaryLinks?: number;
  /** Right-aligned content (e.g., auth buttons) */
  rightSlot?: React.ReactNode;
  className?: string;
};

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function Nav({
  logo,
  links,
  maxPrimaryLinks = 6,
  rightSlot,
  className,
}: NavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false); // mobile sheet

  // Split into primary + overflow for scalable navigation
  const primary = React.useMemo(() => links.slice(0, maxPrimaryLinks), [links, maxPrimaryLinks]);
  const overflow = React.useMemo(() => links.slice(maxPrimaryLinks), [links, maxPrimaryLinks]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 px-3 sm:px-4">
        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] p-0 sm:w-96">
            <SheetHeader className="px-4 pt-4">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)] p-2">
              <MobileList links={links} onNavigate={() => setOpen(false)} />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex min-w-0 items-center gap-2">
          {logo ?? (
            <Link href="/" className="font-semibold tracking-tight text-slate-900">
              Brand
            </Link>
          )}
        </div>

        {/* Desktop navigation */}
        <div className="ml-2 hidden flex-1 items-center sm:flex">
          <NavigationMenu className="max-w-full">
            <NavigationMenuList className="flex max-w-[70vw] flex-1 items-center gap-1">
              {primary.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.children && item.children.length > 0 ? (
                    <NestedDropdown item={item} activePath={pathname} />
                  ) : (
                    <NavItemLink item={item} activePath={pathname} />
                  )}
                </NavigationMenuItem>
              ))}

              {/* Overflow */}
              {overflow.length > 0 && (
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1">
                        More <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel>More</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {overflow.map((item) => (
                          <OverflowItem key={item.label} item={item} activePath={pathname} />
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right slot */}
        <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}

// ---------------------------------------------
// Desktop primitives
// ---------------------------------------------
function NavItemLink({ item, activePath }: { item: NavLink; activePath: string | null }) {
  const isActive = item.href && activePath ? normalizePath(activePath) === normalizePath(item.href) : false;
  return (
    <Link href={item.href ?? "#"} legacyBehavior passHref>
      <NavigationMenuLink
        className={cn(
          "rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900",
          isActive && "bg-slate-100 text-slate-900",
        )}
      >
        <span className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
              {item.badge}
            </span>
          )}
        </span>
      </NavigationMenuLink>
    </Link>
  );
}

function NestedDropdown({ item, activePath }: { item: NavLink; activePath: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1">
          {item.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {item.badge && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              {item.label}
              <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                {item.badge}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownGroups items={item.children ?? []} activePath={activePath} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownGroups({ items, activePath }: { items: NavLink[]; activePath: string | null }) {
  return (
    <DropdownMenuGroup>
      {items.map((child) => {
        if (child.children && child.children.length > 0) {
          return (
            <DropdownMenuSub key={child.label}>
              <DropdownMenuSubTrigger>
                <span className="flex items-center justify-between gap-2">
                  {child.label}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownGroups items={child.children} activePath={activePath} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        }
        return (
          <DropdownMenuItem key={child.label} asChild>
            <Link
              href={child.href ?? "#"}
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100",
                isActivePath(activePath, child.href) && "bg-slate-100 text-slate-900"
              )}
            >
              {child.label}
            </Link>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
  );
}

function OverflowItem({ item, activePath }: { item: NavLink; activePath: string | null }) {
  if (item.children && item.children.length > 0) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <span className="flex items-center justify-between gap-2">
            {item.label}
            <ChevronRight className="h-4 w-4" />
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-64">
          <DropdownGroups items={item.children} activePath={activePath} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href ?? "#"}
        className={cn(
          "block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100",
          isActivePath(activePath, item.href) && "bg-slate-100 text-slate-900"
        )}
      >
        {item.label}
      </Link>
    </DropdownMenuItem>
  );
}

// ---------------------------------------------
// Mobile list
// ---------------------------------------------
function MobileList({ links, onNavigate }: { links: NavLink[]; onNavigate?: () => void }) {
  return (
    <nav className="px-2 pb-6">
      <ul className="flex flex-col gap-1">
        {links.map((item) => (
          <MobileNode key={item.label} item={item} depth={0} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
}

function MobileNode({ item, depth, onNavigate }: { item: NavLink; depth: number; onNavigate?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = !!(item.children && item.children.length > 0);

  return (
    <li>
      <div className={cn("flex items-center", depth > 0 && "pl-2")}>        
        {hasChildren ? (
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex items-center gap-2">
              {item.label}
              {item.badge && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  {item.badge}
                </span>
              )}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        ) : (
          <Link
            href={item.href ?? "#"}
            onClick={onNavigate}
            className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        )}
      </div>

      {hasChildren && open && (
        <ul className="mt-1 flex flex-col gap-1 border-l pl-3">
          {item.children!.map((child) => (
            <MobileNode key={child.label} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------------------------------------
// Utils
// ---------------------------------------------
function isActivePath(activePath: string | null, href?: string) {
  if (!activePath || !href) return false;
  return normalizePath(activePath) === normalizePath(href);
}
function normalizePath(p: string) {
  try {
    // Remove trailing slash for consistent compare
    return new URL(p, "https://example.com").pathname.replace(/\/$/, "");
  } catch {
    return p.replace(/\/$/, "");
  }
}

// ---------------------------------------------
// Usage example (remove or adapt)
// ---------------------------------------------
// const links: NavLink[] = [
//   { label: "Home", href: "/" },
//   {
//     label: "Products",
//     children: [
//       { label: "All Products", href: "/products" },
//       {
//         label: "By Category",
//         children: [
//           { label: "Cameras", href: "/products/cameras" },
//           { label: "Audio", href: "/products/audio" },
//           { label: "Lighting", href: "/products/lighting" },
//         ],
//       },
//     ],
//   },
//   { label: "Pricing", href: "/pricing", badge: "New" },
//   { label: "Guides", href: "/guides" },
//   { label: "Blog", href: "/blog" },
//   { label: "About", href: "/about" },
//   { label: "Careers", href: "/careers" }, // will go into More
//   { label: "Support", href: "/support" }, // will go into More
// ];
//
// <Nav
//   logo={<Link href="/" className="font-bold">Filmsentralen</Link>}
//   links={links}
//   rightSlot={<Button asChild><Link href="/login">Sign in</Link></Button>}
//   maxPrimaryLinks={6}
// />
