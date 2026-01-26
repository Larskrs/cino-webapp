import { redirect } from "next/navigation"
import { signOut } from "@/server/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Logo from "public/lucide/logo"
import { Home, LogOut } from "lucide-react"
import Link from "next/link"

export default async function SignOutPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {

  const { callbackUrl } = await searchParams

  return (
    <div className="flex flex-col lg:flex-row lg:px-8 xl:flex-col justify-center lg:justify-between xl:justify-center gap-4 w-full h-full items-center">

      <div className="w-full flex flex-col items-start justify-center mb-12">
        <Logo className="h-8 lg:h-10 xl:h-14 mb-4" />
        <h1 className="lg:text-2xl">Du er alltid velkommen tilbake</h1>
        <p className="text-muted-foreground">
          Trykk nedenfor for å logge ut, eller for å bli innlogget
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {/* ✅ SERVER ACTION */}
        <form
          action={async () => {
            "use server"
            await signOut({
              redirectTo: callbackUrl ?? "/",
            })
          }}
        >
          <Button
            type="submit"
            className={cn(
              "text-xl w-full px-5 py-2 rounded-lg",
              "bg-neutral-100 border border-neutral-200",
              "shadow-lg shadow-black/5 text-neutral-800",
              "hover:bg-neutral-800 hover:text-neutral-100",
              "dark:text-black dark:border-neutral-700",
              "pr-8 flex gap-4 justify-center"
            )}
          >
            <LogOut />
            <span>Logg ut</span>
          </Button>
        </form>

        <Link
          href="/"
          className={cn(
            "text-xl w-full px-5 py-2 rounded-lg",
            "bg-neutral-100 border border-neutral-200",
            "shadow-lg shadow-black/5 text-neutral-800",
            "hover:bg-neutral-800 hover:text-neutral-100",
            "dark:text-black dark:border-neutral-700",
            "pr-8 flex gap-4 justify-center"
          )}
        >
          <Home />
          <span>Tilbake</span>
        </Link>
      </div>
    </div>
  )
}
