import Image from "next/image"
import Link from "next/link";

type FeaturedItem = {
  title: string,
  description?: string,
  thumbnail: string,
  slug: string,
  publishedAt?: string
}

export default function FeaturedComponent ({
  title,
  description,
  thumbnail,
  slug,
  publishedAt
}:FeaturedItem) {
  return (
    <div className="container max-w-7xl mx-auto mt-4 p-2">
      <Link href={`/serie/${slug}`} className="text-accent">
        <h2 className="hidden md:flex text-2xl lg:text-3xl font-semibold mb-1">{title}</h2>
        <div className="w-full rounded-xl bg-background overflow-hidden">
          <div className="grid grid-cols-5">

            {/* Thumbnail */}
            <div className="col-span-full md:col-span-3 aspect-video relative">
              <p className="absolute left-4 top-4 z-1 bg-accent text-background px-3 py-0.5 rounded-sm">{publishedAt}</p>
              <Image
                src={thumbnail}
                alt="what"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                />
            </div>

            {/* Text panel */}
            <div className="col-span-full md:col-span-2 bg-black/36 h-full flex flex-col justify-center p-6">
              <div>
                <h2 className="flex md:hidden text-lg sm:text-xl font-semibold">{title}</h2>
                <p className="text-base lg:text-lg text-muted-foreground mt-0">
                  Description text goes here
                </p>
              </div>
            </div>

          </div>
        </div>
      </Link>
    </div>
  )
}