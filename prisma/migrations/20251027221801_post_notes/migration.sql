-- CreateEnum
CREATE TYPE "public"."PostNoteRatingValue" AS ENUM ('HELPFUL', 'SOMEWHAT_HELPFUL', 'NOT_HELPFUL');

-- CreateTable
CREATE TABLE "public"."PostNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sources" JSONB,
    "helpfulScore" DOUBLE PRECISION DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PostNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostNoteRating" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" "public"."PostNoteRatingValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostNoteRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostNoteRating_noteId_userId_key" ON "public"."PostNoteRating"("noteId", "userId");

-- AddForeignKey
ALTER TABLE "public"."PostNote" ADD CONSTRAINT "PostNote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostNote" ADD CONSTRAINT "PostNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostNoteRating" ADD CONSTRAINT "PostNoteRating_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."PostNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostNoteRating" ADD CONSTRAINT "PostNoteRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
