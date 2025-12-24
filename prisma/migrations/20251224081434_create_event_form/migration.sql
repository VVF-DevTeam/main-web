-- CreateTable
CREATE TABLE "EventForm" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "FormData" JSONB NOT NULL,

    CONSTRAINT "EventForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventForm" ADD CONSTRAINT "EventForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
