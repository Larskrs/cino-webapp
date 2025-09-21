import Avatar from "@/app/_components/users/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { Dot } from "lucide-react";
import Image from "next/image";
import FollowButton from "../_components/follow-button";
import { auth } from "@/server/auth";

export default async function UserPage ({
  params,
}: {
  params: Promise<{ id: string }>
}) {

    const { id } = await params
    const session = await auth()
    const user = await api.users.get({ id });

    return (
        <div className="max-w-7xl mx-auto w-full p-4">
            <div>
                <Image src={user?.image || ""} className="w-full aspect-[3/1] object-cover rounded-2xl" width={720} height={240} alt="banner" />
            </div>
            <div className="flex gap-4 p-6">
                <Avatar className={cn("size-48 -translate-y-20 border-4")} src={user?.image || ""} />
                <div>
                    <h1 className="text-2xl font-semibold sm:text-3xl">{user?.name}</h1>
                    <div className="flex gap-4 opacity-75">
                        <p>Følgere: {user?._count?.followers}</p>
                        <Dot />
                        <p>Følger: {user?._count?.following}</p>
                    </div>
                    {session?.user.id !== id && <div className="mt-4">
                        <FollowButton userId={id} />
                    </div>}
                </div>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await api.users.get({ id });

  if (!user) {
    return {
      title: "Bruker ikke funnet - Cino",
      description: "Denne brukeren eksisterer ikke.",
    };
  }

  const title = `${user.name} (@${user.name || "bruker"}) • Cino`;
  const description = `${user.name} har ${user._count?.followers ?? 0} følgere og følger ${user._count?.following ?? 0}. Bli med på Cino!`;
  const image = user.image || "/default-user.png";
  const url = `https://cino.no/user/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Cino",
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: `${user.name} sin profilbilde`,
        },
      ],
      locale: "nb_NO",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}