-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "EventSeries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL,

    CONSTRAINT "EventSeries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventSeries_name_key" ON "EventSeries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventSeries_keyName_key" ON "EventSeries"("keyName");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "EventSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
