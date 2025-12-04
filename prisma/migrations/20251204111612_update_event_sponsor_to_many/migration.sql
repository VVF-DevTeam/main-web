/*
  Warnings:

  - You are about to drop the column `eventId` on the `EventSponsor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventSponsor" DROP CONSTRAINT "EventSponsor_eventId_fkey";

-- AlterTable
ALTER TABLE "EventSponsor" DROP COLUMN "eventId";

-- CreateTable
CREATE TABLE "_EventToSponsor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToSponsor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToSponsor_B_index" ON "_EventToSponsor"("B");

-- AddForeignKey
ALTER TABLE "_EventToSponsor" ADD CONSTRAINT "_EventToSponsor_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSponsor" ADD CONSTRAINT "_EventToSponsor_B_fkey" FOREIGN KEY ("B") REFERENCES "EventSponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
