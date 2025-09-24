"use client";

import React from "react";
import { api } from "@/trpc/react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TrendingTags() {
  const { data, isLoading } = api.hashtags.trending.useQuery({ days: 1 });
  const { colors } = useTheme();

  if (isLoading) return <div>Laster trender…</div>;
  if (!data?.length) return <div>Ingen trender ennå</div>;

  return (
    <div className="space-y-2 max-w-full">
      <h2 className="text-lg font-semibold">Trender i dag</h2>

      {/* Responsive grid: 3 columns on medium+, 1 column on small */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {data.map((tag) => (
          <Link
            key={`${tag.tag}-${tag.day}`}
            href={`?h=${tag.tag}`}
            className={cn(
              "border-none p-2 px-4 rounded-sm flex flex-row justify-between items-center",
              colors.buttonBackground,
              colors.text
            )}
          >
            <CardTitle className="font-medium">#{tag.tag}</CardTitle>
            <CardDescription className="text-sm">
              {tag.usage_count} innlegg
            </CardDescription>
          </Link>
        ))}
      </div>
    </div>
  );
}
