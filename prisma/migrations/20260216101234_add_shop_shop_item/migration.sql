/*
  Warnings:

  - You are about to drop the column `eventHosts` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShopItemType" AS ENUM ('General', 'Limit', 'Discount');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED', 'COMING_SOON');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventHosts";

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "ownerId" TEXT NOT NULL,
    "eventId" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "termsUrl" TEXT,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "type" "ShopItemType" NOT NULL,
    "imageUrl" TEXT,
    "images" TEXT[],
    "limit" INTEGER,
    "stockCount" INTEGER,
    "lowStockThreshold" INTEGER,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "discountMemberPercent" INTEGER,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "minQuantity" INTEGER DEFAULT 1,
    "maxQuantity" INTEGER,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "tags" TEXT[],
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "subscribedStripePriceId" TEXT,
    "weight" DECIMAL(65,30),
    "weightUnit" TEXT DEFAULT 'kg',
    "dimension" TEXT,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShopToShopItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShopToShopItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_sku_key" ON "ShopItem"("sku");

-- CreateIndex
CREATE INDEX "_ShopToShopItem_B_index" ON "_ShopToShopItem"("B");

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopToShopItem" ADD CONSTRAINT "_ShopToShopItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopToShopItem" ADD CONSTRAINT "_ShopToShopItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
