-- CreateTable
CREATE TABLE "public"."MediaPage" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MediaCategoryToMediaContainer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaCategoryToMediaContainer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaPage_categoryId_key" ON "public"."MediaPage"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaCategory_slug_key" ON "public"."MediaCategory"("slug");

-- CreateIndex
CREATE INDEX "_MediaCategoryToMediaContainer_B_index" ON "public"."_MediaCategoryToMediaContainer"("B");

-- AddForeignKey
ALTER TABLE "public"."MediaPage" ADD CONSTRAINT "MediaPage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."MediaCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaCategory" ADD CONSTRAINT "MediaCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."MediaCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MediaCategoryToMediaContainer" ADD CONSTRAINT "_MediaCategoryToMediaContainer_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."MediaCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MediaCategoryToMediaContainer" ADD CONSTRAINT "_MediaCategoryToMediaContainer_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."MediaContainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
