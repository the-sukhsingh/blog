-- AlterTable
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "bgColorLight" TEXT,
ADD COLUMN IF NOT EXISTS "bgColorDark" TEXT,
ADD COLUMN IF NOT EXISTS "allowComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "bgColorLight" TEXT,
ADD COLUMN IF NOT EXISTS "bgColorDark" TEXT;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_categoryId_fkey') THEN
    ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
