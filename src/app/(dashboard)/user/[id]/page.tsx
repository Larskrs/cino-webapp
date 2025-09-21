"use client";

import { useParams } from "next/navigation";
import Avatar from "@/app/_components/users/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react"; // <-- client hooks
import { Dot } from "lucide-react";
import Image from "next/image";
import FollowButton from "../_components/follow-button";
import { useSession } from "next-auth/react";
import { PostList } from "@/app/_components/posts/list-posts";

export default function UserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session } = useSession();
  const { data: user, isLoading, error } = api.users.get.useQuery({ id });

  if (isLoading) return <p>Laster...</p>;
  if (error) return <p>Noe gikk galt</p>;
  if (!user) return <p>Fant ikke bruker</p>;

  return (
    <div className="max-w-7xl mx-auto w-full p-4">
      <div>
        <Image
          src={user.image || ""}
          className="w-full aspect-[3/1] object-cover rounded-2xl"
          width={720}
          height={240}
          alt="banner"
        />
      </div>
      <div className="flex gap-4 p-6">
        <Avatar
          className={cn("size-48 -translate-y-20 border-4")}
          src={user.image || ""}
        />
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{user.name}</h1>
          <div className="flex gap-4 opacity-75">
            <p>Følgere: {user._count?.followers}</p>
            <Dot />
            <p>Følger: {user._count?.following}</p>
          </div>
          {session?.user && session?.user?.id !== id && (
            <div className="mt-4">
              <FollowButton userId={id} />
            </div>
          )}
        </div>
      </div>

      <PostList userId={id} />
    </div>
  );
}
