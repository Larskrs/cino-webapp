-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('MOVIE', 'SERIES');

-- CreateTable
CREATE TABLE "public"."MediaContainer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "banner" TEXT,
    "type" "public"."MediaType" NOT NULL,
    "genres" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaSeason" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "title" TEXT,
    "seasonNumber" INTEGER,
    "description" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaEpisode" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "episodeNumber" INTEGER,
    "airDate" TIMESTAMP(3),
    "durationSec" INTEGER,
    "videoSrc" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaContainer_slug_key" ON "public"."MediaContainer"("slug");

-- CreateIndex
CREATE INDEX "MediaContainer_type_idx" ON "public"."MediaContainer"("type");

-- CreateIndex
CREATE UNIQUE INDEX "MediaSeason_containerId_seasonNumber_key" ON "public"."MediaSeason"("containerId", "seasonNumber");

-- CreateIndex
CREATE INDEX "MediaEpisode_isLive_idx" ON "public"."MediaEpisode"("isLive");

-- CreateIndex
CREATE UNIQUE INDEX "MediaEpisode_seasonId_episodeNumber_key" ON "public"."MediaEpisode"("seasonId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "public"."MediaSeason" ADD CONSTRAINT "MediaSeason_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "public"."MediaContainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaEpisode" ADD CONSTRAINT "MediaEpisode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."MediaSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
