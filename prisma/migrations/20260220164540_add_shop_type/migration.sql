-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('General', 'Food', 'Clothes', 'Event', 'Fundraiser', 'Digital', 'Seasonal');

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "type" "ShopType" NOT NULL DEFAULT 'General';
