"use client";

import { useParams } from "next/navigation";
import Avatar from "@/app/_components/users/avatar";
import { cn, getLocalFileURL } from "@/lib/utils";
import { api } from "@/trpc/react"; // <-- client hooks
import { Dot, Heart, ImageIcon, Pin, User } from "lucide-react";
import Image from "next/image";
import FollowButton from "../_components/follow-button";
import { useSession } from "next-auth/react";
import { PostList } from "@/app/_components/posts/list-posts";
import { Button } from "@/components/ui/button";
import ChangeBannerDialog from "@/app/(dashboard)/user/_components/change-banner-dialog";
import ChangeImageDialog from "../_components/change-image-dialog";
import FollowersDialog from "../_components/followers-dialog";
import FollowingDialog from "../_components/following-dialog";
import { useTheme } from "@/hooks/use-theme";

export default function UserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session } = useSession();
  const { data: user, isLoading, error } = api.users.get.useQuery({ id });

  if (isLoading) return <p>Laster...</p>;
  if (error) return <p>Noe gikk galt</p>;
  if (!user) return <p>Fant ikke bruker</p>;

  const { colors } = useTheme()

  return (
    <div className="p-4 mx-auto max-w-7xl w-full">
      <header className="relative w-full">
  {/* Banner */}
  <div className="relative mx-auto h-auto w-full max-w-10xl aspect-[5/3] md:aspect-[3/1]">
    <Image
      src={getLocalFileURL(user.banner || "") || user.image || ""}
      alt="banner"
      fill
      className="object-cover rounded-2xl w-full"
      priority
    />

    {session?.user?.id === id && (
      <div className="absolute left-4 top-4 z-10">
        <ChangeBannerDialog>
          <Button size="sm" variant="secondary" className="flex gap-2 items-center">
            <ImageIcon size={14} /> Endre banner
          </Button>
        </ChangeBannerDialog>
      </div>
    )}
  </div>

  {/* Avatar + Info */}
  <div className="relative flex flex-col items-center -mt-20 sm:-mt-24 px-4">
    <ChangeImageDialog defaultValue={user.image || ""}>
      <Avatar
        src={user.image || ""}
        className={cn(
          "size-38 sm:size-48 rounded-full border-8 border-background hover:scale-102 transition-transform cursor-pointer",
          colors.backgroundBorder
        )}
      />
    </ChangeImageDialog>

    {/* Name + Actions */}
    <div className="mt-4 flex flex-col items-center text-center">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{user.name}</h1>

      {/* Stats */}
      <div className="flex gap-6 mt-2 text-sm sm:text-base opacity-80">
        <FollowersDialog userId={user.id}>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-100">
            <User size={16} />
            <p>
              <span className="font-semibold">{user._count?.followers}</span>{" "}
              følger{user._count?.followers == 1 ? "" : "e"}
            </p>
          </div>
        </FollowersDialog>

        <FollowingDialog userId={user.id}>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-100">
            <p>
              Følger{" "}
              <span className="font-semibold">{user._count?.following}</span>
            </p>
          </div>
        </FollowingDialog>
      </div>

      <div className="mt-2 flex items-center gap-2 opacity-50">
        <Pin size={20} />
        Norge/Noreg (endre snart)
      </div>

      {/* Follow button (if not self) */}
      {session?.user && session?.user?.id !== id && (
        <div className="mt-4">
          <FollowButton userId={id} />
        </div>
      )}
    </div>
  </div>
</header>


      <div className="z-10 p-4 mx-auto max-w-2xl">
        <PostList userId={id} />
      </div>
    </div>
  );
}
