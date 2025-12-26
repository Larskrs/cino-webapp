"use client"

import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Hero() {
  return (
    <section className="w-full">
      <div className="container max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col items-start">
            <EyebrowBadge>
              <Sparkles className="h-3.5 w-3.5" />
              Norsk workflow for media-produksjon
            </EyebrowBadge>

            <HeroTitle
              title="Planlegg. Produser. Publiser."
              subtitle="Få oversikt på minutter — ikke dager."
            />

            <HeroDescription>
              Cino samler brief, shotlist, tidsplan, filer og godkjenning i én enkel flyt.
              Mindre ping-pong. Raskere leveranser. Bedre samarbeid med kunder.
            </HeroDescription>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
              <PrimaryCta href="#cta">Kom i gang gratis</PrimaryCta>
              <SecondaryCta href="#product">Se hvordan det fungerer</SecondaryCta>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <TagPill>Brief</TagPill>
              <TagPill>Shotlist</TagPill>
              <TagPill>Call sheet</TagPill>
              <TagPill>Assets</TagPill>
              <TagPill>Godkjenning</TagPill>
              <TagPill>Leveranse</TagPill>
            </div>
          </div>

          {/* Right */}
          <div className="relative w-full md:justify-self-end">
            <ImageFrame>
              <Image
                src="/api/v1/files?fid=7fwolgrgbmb7"
                alt="Cino dashboard preview"
                width={1200}
                height={650}
                className="h-80 md:h-100 lg:h-120 min-w-md w-full object-cover"
                priority
              />
            </ImageFrame>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Reusable -------------------------------- */

function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
    >
      {children}
    </Badge>
  )
}

function HeroTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-4">
      <h1 className="text-balance text-5xl md:text-6xl font-semibold tracking-tight sm:text-4xl">
        {title}
        {subtitle ? (
          <span className="text-3xl mt-2 block text-balance text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </h1>
    </div>
  )
}

function HeroDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
      {children}
    </p>
  )
}

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 sm:w-auto"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  )
}

function SecondaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground/80 shadow-sm transition hover:bg-accent hover:text-foreground sm:w-auto"
    >
      {children}
      <ArrowRight className="h-4 w-4 opacity-70" />
    </a>
  )
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full border-border px-3 py-1 text-xs text-muted-foreground"
    >
      {children}
    </Badge>
  )
}

function ImageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-fuchsia-500/15 blur-2xl"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
