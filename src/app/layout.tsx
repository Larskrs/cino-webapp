import "@/styles/globals.css";

import { type Metadata } from "next";
import { Courier_Prime, Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { auth } from "@/server/auth";
import { PostPreviewProvider } from "@/hooks/post-preview";
import { ContextMenuProvider } from "@/hooks/context-menu-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Cino.no",
  description: "Digitale produksjonsverktøy for Film & TV",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const courier = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-courier",
  weight: ["400", "700"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("theme")?.value as
    | "light"
    | "dark"
    | undefined;

  // fetch session on the server
  const session = await auth()

  return (
    <html lang="en" className={cn(geist.variable, courier.variable)}>
      <ThemeProvider initialTheme={savedTheme}>
        <SessionProvider session={session}>
          <PostPreviewProvider>
            <TRPCReactProvider>
              <ContextMenuProvider>
                {children}
                <Toaster />
              </ContextMenuProvider>
            </TRPCReactProvider>
          </PostPreviewProvider>
        </SessionProvider>
      </ThemeProvider>
    </html>
  );
}
