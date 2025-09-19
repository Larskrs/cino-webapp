import cn from "@/lib/classname"
import Image from "next/image"

type AvatarType = {
    src: string | null
    className?: string
}

export default function Avatar ({ src, className }:AvatarType) {
    if (src) return (
        <Image alt="user-avatar" src={src || "/svg/user/placeholder-avatar.svg"} width={128} height={128} className={cn("rounded-full aspect-square", className)}></Image>
    )
}