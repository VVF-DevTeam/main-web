/*
  Warnings:

  - You are about to drop the column `taxable` on the `ShopItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShopItem" DROP COLUMN "taxable",
ADD COLUMN     "taxPercent" INTEGER;
