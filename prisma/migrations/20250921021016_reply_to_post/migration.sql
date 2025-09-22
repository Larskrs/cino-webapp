-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
