-- CreateTable
CREATE TABLE "public"."Follower" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Follower_followerId_idx" ON "public"."Follower"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "Follower_userId_followerId_key" ON "public"."Follower"("userId", "followerId");

-- AddForeignKey
ALTER TABLE "public"."Follower" ADD CONSTRAINT "Follower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follower" ADD CONSTRAINT "Follower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
