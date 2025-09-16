import "@/styles/globals.css";

import { type Metadata } from "next";
import { Courier_Prime, Cutive, Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/hooks/use-theme";
 import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { cookies } from "next/headers";

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
  weight: ["400", "700"]
});



export default async function RootLayout({
  children,
  session,
}: Readonly<{ children: React.ReactNode, session: Session }>) {

  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("theme")?.value as "light" | "dark" | undefined;

  return (
    <html lang="en" className={cn(geist.variable, courier.variable)}>
      <ThemeProvider initialTheme={savedTheme}>
          <SessionProvider session={session}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SessionProvider>
      </ThemeProvider>
    </html>
  );
}
