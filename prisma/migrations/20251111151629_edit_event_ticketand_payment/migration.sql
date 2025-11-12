/*
  Warnings:

  - You are about to drop the column `eventId` on the `EventCategory` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `EventTicket` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `stripePriceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `stripePriceId` to the `EventTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeProductId` to the `EventTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketType" ADD VALUE 'EarlyBird';
ALTER TYPE "TicketType" ADD VALUE 'Student';

-- AlterTable
ALTER TABLE "EventCategory" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "EventTicket" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CAD',
ADD COLUMN     "sold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripePriceId" TEXT NOT NULL,
ADD COLUMN     "stripeProductId" TEXT NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePriceId",
DROP COLUMN "stripeProductId",
ADD COLUMN     "eventTicketId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventTicketId_fkey" FOREIGN KEY ("eventTicketId") REFERENCES "EventTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
