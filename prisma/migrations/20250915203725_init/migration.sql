/*
  Warnings:

  - You are about to drop the column `name` on the `Post` table. All the data in the column will be lost.
  - Added the required column `body` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ScriptVersion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Scene" DROP CONSTRAINT "Scene_versionId_fkey";

-- DropIndex
DROP INDEX "public"."Post_name_idx";

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "name",
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "body" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ScriptVersion" ADD COLUMN     "content" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Post_id_idx" ON "public"."Post"("id");

-- AddForeignKey
ALTER TABLE "public"."Scene" ADD CONSTRAINT "Scene_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."ScriptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
