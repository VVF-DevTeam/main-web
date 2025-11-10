-- DropForeignKey
ALTER TABLE "EventSchedule" DROP CONSTRAINT "EventSchedule_eventId_fkey";

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
