"use server"

import { redirect } from "next/navigation"
import { signIn } from "@/server/auth"
import { AuthError } from "next-auth"
import logger from "logger.mjs"

const SIGNIN_ERROR_URL = "/error"

async function signInAction(
  providerId: string,
  callbackUrl?: string
) {
  logger.info("Sign-in attempt", {
    providerId,
    callbackUrl,
  })

  try {
    await signIn(providerId, {
      redirectTo: callbackUrl ?? "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      logger.info("AuthError during sign-in", {
        providerId,
        type: error.type,
        cause: error.cause,
      })

      redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
    }

    logger.error("Unknown error during sign-in", {
      providerId,
      callbackUrl,
      error,
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw error
  }
}

import { providerMap } from "@/server/auth"
import { cn } from "@/lib/utils"
import Logo from "public/lucide/logo"
import Discord from "public/lucide/discord"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  logger.info("SignInPage rendered", {
    providers: Object.values(providerMap).map(p => p.id),
  })

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 xl:flex lg:flex-row lg:px-8 xl:flex-col justify-center lg:justify-between xl:justify-center gap-4 w-full h-full items-center">
      <div className="flex flex-col w-full items-start justify-center mb-12">
        <Logo className="h-8 lg:h-10 xl:h-14 mb-4" />
        <h1 className="lg:text-2xl">Velkommen tilbake</h1>
        <p className="text-muted-foreground">
          Venligst velg din autentiserings-tjeneste for å fortsette
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {Object.values(providerMap).map((provider) => (
          <form
            key={provider.id}
            action={signInAction.bind(
              null,
              provider.id,
              callbackUrl
            )}
          >
            <button
              type="submit"
              className={cn(
                "group text-xl w-full pl-8 py-4 rounded-lg",
                "px-8 flex gap-6 items-center duration-300",
                "bg-primary text-background hover:text-primary hover:bg-background",
                "border border-primary/75"
              )}
            >
              <Discord className="size-8 group-hover:scale-110 duration-150" />
              <span>Logg inn med {provider.name}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  )
}
