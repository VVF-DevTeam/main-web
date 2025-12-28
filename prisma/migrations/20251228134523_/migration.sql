/*
  Warnings:

  - You are about to drop the column `sold` on the `EventTicket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventTicket" DROP COLUMN "sold",
ADD COLUMN     "capacityPerTicket" INTEGER NOT NULL DEFAULT 1;
