import Avatar from "@/app/_components/users/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import Link from "next/link"
import type { ReactNode } from "react"

type PageProps = {
    userId: string,
    children: ReactNode
}

export default function FollowersDialog ({userId, children}:PageProps) {

      const { data: followers, isLoading, error } = api.users.getFollowers.useQuery({ userId });
    
      if (isLoading) return <p>Laster...</p>;
      if (error) return <p>Noe gikk galt</p>;
      if (!followers) return <p>Fant ingen følgere</p>;

    return (
        <Dialog>
            <DialogTrigger className="cursor-pointer">{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Følgere</DialogTitle>
                </DialogHeader>
                <div className="flex w-full flex-row gap-2 overflow-y-auto">
                    {followers?.map((f,i) => {
                        return (
                            <Link href={`/user/${f.user.id}`} className="flex gap-4 items-center">
                                <Avatar className="size-12" src={f.user.image} />
                                <p className="text-xl font-semibold">{f.user.name}</p>
                            </Link>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )

}