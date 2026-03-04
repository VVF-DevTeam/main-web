/*
  Warnings:

  - You are about to drop the column `tags` on the `ShopItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShopItem" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "ShopItemTag" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ShopItemTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShopItemTagToShopItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShopItemTagToShopItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ShopItemTagToShopItem_B_index" ON "_ShopItemTagToShopItem"("B");

-- AddForeignKey
ALTER TABLE "_ShopItemTagToShopItem" ADD CONSTRAINT "_ShopItemTagToShopItem_A_fkey" FOREIGN KEY ("A") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopItemTagToShopItem" ADD CONSTRAINT "_ShopItemTagToShopItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ShopItemTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
