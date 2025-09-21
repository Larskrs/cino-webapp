import { api } from "@/trpc/server";
import type { ReactNode } from "react";

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

export default async function Layout ({children}:{children: ReactNode}) {
    return (
        <div>{children}</div>
    )
}