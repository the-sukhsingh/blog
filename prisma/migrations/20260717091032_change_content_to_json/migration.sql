/*
  Warnings:

  - You are about to drop the column `contentJson` on the `Post` table. All the data in the column will be lost.
  - Changed the type of `content` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "contentJson",
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
