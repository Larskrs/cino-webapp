/*
  Warnings:

  - The `role` column on the `ProjectMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('admin', 'manager', 'member', 'guest', 'banned');

-- AlterTable
ALTER TABLE "public"."ProjectMember" DROP COLUMN "role",
ADD COLUMN     "role" "public"."ProjectRole" NOT NULL DEFAULT 'banned';

-- DropEnum
DROP TYPE "public"."Role";
