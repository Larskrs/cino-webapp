import cn from "@/lib/classname"
import Image from "next/image"

type AvatarType = {
    src: string | null
    width?: number,
    height?: number,
    quality?: number,
    className?: string
}

export default function Avatar ({ src, className, height=128, width=128, quality }:AvatarType) {
    if (src) return (
        <Image alt="user-avatar" src={src || "/svg/user/placeholder-avatar.svg"} {...{height, width, quality}} className={cn("rounded-full aspect-square object-cover", className)}></Image>
    )
}