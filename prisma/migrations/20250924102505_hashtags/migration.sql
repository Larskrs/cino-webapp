-- CreateTable
CREATE TABLE "public"."Hashtag" (
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "public"."PostHashtag" (
    "postId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostHashtag_pkey" PRIMARY KEY ("postId","tag")
);

-- CreateIndex
CREATE INDEX "PostHashtag_tag_createdAt_idx" ON "public"."PostHashtag"("tag", "createdAt");

-- CreateIndex
CREATE INDEX "PostHashtag_postId_idx" ON "public"."PostHashtag"("postId");

-- AddForeignKey
ALTER TABLE "public"."PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostHashtag" ADD CONSTRAINT "PostHashtag_tag_fkey" FOREIGN KEY ("tag") REFERENCES "public"."Hashtag"("tag") ON DELETE CASCADE ON UPDATE CASCADE;
