"use client";

import { useParams } from "next/navigation";
import Avatar from "@/app/_components/users/avatar";
import { cn, getLocalFileURL } from "@/lib/utils";
import { api } from "@/trpc/react"; // <-- client hooks
import { Dot, Heart, ImageIcon, User } from "lucide-react";
import Image from "next/image";
import FollowButton from "../_components/follow-button";
import { useSession } from "next-auth/react";
import { PostList } from "@/app/_components/posts/list-posts";
import { Button } from "@/components/ui/button";
import ChangeBannerDialog from "@/app/(dashboard)/user/_components/change-banner-dialog";
import ChangeImageDialog from "../_components/change-image-dialog";

export default function UserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session } = useSession();
  const { data: user, isLoading, error } = api.users.get.useQuery({ id });

  if (isLoading) return <p>Laster...</p>;
  if (error) return <p>Noe gikk galt</p>;
  if (!user) return <p>Fant ikke bruker</p>;

  return (
    <div className="max-w-7xl mx-auto w-screen">
        <Image
          src={getLocalFileURL(user.banner || "") || user.image || ""}
          className="w-screen blur-2xl inset-0 max-h-125 mx-auto max-w-360 scale-100 opacity-25 absolute aspect-[5/3] sm:aspect-[3/1] object-cover"
          width={720}
          height={320}
          quality={10}
          alt="banner"
        />
      <div className="p-4 pb-0 relative w-full aspect-[5/3] sm:aspect-[3/1]">
        {session?.user?.id === id && <div className="z-1 absolute left-6 top-6">
            <ChangeBannerDialog className="z-10">
                <Button><ImageIcon size={8} />Endre bilde</Button>
            </ChangeBannerDialog>
        </div>} 
        <Image
          src={getLocalFileURL(user.banner || "") || user.image || ""}
          className="w-full aspect-[5/3] sm:aspect-[3/1] object-cover rounded-lg"
          width={1920}
          height={640}
          quality={100}
          alt="banner"
        />
      </div>
      <div className="flex gap-4 p-4 pt-2.5 sm:p-6 sm:pt-5 items-center">
        <div className="relative ml-8 h-0 w-32 sm:w-48">
          <ChangeImageDialog>
            <Avatar
              className={cn("hover:scale-105 duration-150 cursor-pointer absolute size-32 -translate-y-24 sm:size-42 sm:-translate-y-36")}
              src={user.image || ""}
            />
          </ChangeImageDialog>  
        </div>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{user.name}</h1>
          <div className="flex gap-8 opacity-75">
            <div className="flex items-center gap-2">
                <User size={16} />
                <p><span className="font-bold">{user._count?.followers}</span> følger{user._count?.followers <= 1 ? "" : "e"}</p>
            </div>
            <div className="flex items-center gap-2">
                <p>Følger{user._count?.following <= 1 ? "" : "e"} <span className="font-bold">{user._count?.following}</span></p>
            </div>
          </div>
          {session?.user && session?.user?.id !== id && (
            <div className="mt-4">
              <FollowButton userId={id} />
            </div>
          )}
        </div>
      </div>
      <div className="z-10 mx-auto">
        <PostList userId={id} />
      </div>
    </div>
  );
}
