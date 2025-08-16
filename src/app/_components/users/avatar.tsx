import cn from "@/lib/classname"
import Image from "next/image"

type AvatarType = {
    src: string | null
    className?: string
}

export default function Avatar ({ src, className }:AvatarType) {
    if (src) return (
        <Image alt="user-avatar" src={src} width={128} height={128} className={cn("rounded-full aspect-square", className)}></Image>
    )
    else return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )
}