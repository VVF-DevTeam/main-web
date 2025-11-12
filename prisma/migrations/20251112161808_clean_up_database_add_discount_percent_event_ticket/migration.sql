/*
  Warnings:

  - You are about to drop the column `ticketsSold` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `stripePaymentId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stripePriceId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stripeProductId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "ticketsSold";

-- AlterTable
ALTER TABLE "EventTicket" ADD COLUMN     "discountMemberPercent" INTEGER;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "stripePaymentId" SET NOT NULL,
ALTER COLUMN "stripePriceId" SET NOT NULL,
ALTER COLUMN "stripeProductId" SET NOT NULL;

-- DropTable
DROP TABLE "Purchase";

-- DropTable
DROP TABLE "Ticket";
