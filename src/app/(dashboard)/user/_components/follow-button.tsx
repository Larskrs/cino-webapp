"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function FollowButton({ userId }: { userId: string }) {
  const utils = api.useUtils();

  const { data: isFollowing, isLoading: isChecking } = api.users.isFollowing.useQuery(
    { userId }
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const followMutation = api.users.follow.useMutation({
    onSuccess: async () => {
      setErrorMessage(null);
      await utils.users.isFollowing.invalidate({ userId }); // refresh state
      await utils.users.get.invalidate({ id: userId }); // refresh counts
    },
    onError: (error) => setErrorMessage(error.message || "Noe gikk galt, prøv igjen."),
  });

  const unfollowMutation = api.users.unfollow.useMutation({
    onSuccess: async () => {
      setErrorMessage(null);
      await utils.users.isFollowing.invalidate({ userId });
      await utils.users.get.invalidate({ id: userId });
    },
    onError: (error) => setErrorMessage(error.message || "Noe gikk galt, prøv igjen."),
  });

  const handleClick = () => {
    setErrorMessage(null);
    if (isFollowing) {
      unfollowMutation.mutate({ userId });
    } else {
      followMutation.mutate({ userId });
    }
  };

  const isMutating = followMutation.isPending || unfollowMutation.isPending;
  const { colors } = useTheme()

  return (
    <div className="flex flex-col gap-2">
      <Button
        className={cn(
            "cursor-pointer",
            isFollowing || isChecking || isMutating
                ? "bg-zinc-500"
                : "bg-indigo-600"
        )}
        onClick={handleClick}
        disabled={isMutating || isChecking}
      >
        {isChecking
          ? "..."
          : isMutating
          ? "..."
          : isFollowing
          ? "Slutt å følge"
          : "Følg"}
      </Button>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
