/*
  Warnings:

  - Made the column `payTotalNumber` on table `EventTicket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EventTicket" ALTER COLUMN "payTotalNumber" SET NOT NULL;
