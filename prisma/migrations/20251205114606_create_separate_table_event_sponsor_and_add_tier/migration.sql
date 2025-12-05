/*
  Warnings:

  - You are about to drop the `_EventToSponsor` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('Platinum', 'Gold', 'Silver', 'Bronze');

-- DropForeignKey
ALTER TABLE "_EventToSponsor" DROP CONSTRAINT "_EventToSponsor_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSponsor" DROP CONSTRAINT "_EventToSponsor_B_fkey";

-- DropTable
DROP TABLE "_EventToSponsor";

-- CreateTable
CREATE TABLE "SponsorOnEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "tier" "SponsorTier" NOT NULL DEFAULT 'Bronze',
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorOnEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorOnEvent_eventId_idx" ON "SponsorOnEvent"("eventId");

-- CreateIndex
CREATE INDEX "SponsorOnEvent_sponsorId_idx" ON "SponsorOnEvent"("sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorOnEvent_eventId_sponsorId_key" ON "SponsorOnEvent"("eventId", "sponsorId");

-- AddForeignKey
ALTER TABLE "SponsorOnEvent" ADD CONSTRAINT "SponsorOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorOnEvent" ADD CONSTRAINT "SponsorOnEvent_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "EventSponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
