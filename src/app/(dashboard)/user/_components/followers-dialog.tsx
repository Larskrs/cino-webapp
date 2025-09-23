import Avatar from "@/app/_components/users/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/trpc/react"
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
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Følgere</DialogTitle>
                </DialogHeader>
                <div className="flex h-16 w-full flex-row gap-2 overflow-x-scroll">
                    {followers?.map((f,i) => {
                        return (
                            <Avatar src={f.user.image}  />
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )

}