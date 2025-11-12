/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePriceId",
DROP COLUMN "stripeProductId";
