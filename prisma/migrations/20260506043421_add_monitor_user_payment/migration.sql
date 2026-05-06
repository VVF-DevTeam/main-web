-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "monitorUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_monitorUserId_fkey" FOREIGN KEY ("monitorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
