-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "CheckoutSessionData" ADD COLUMN     "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "CheckoutSessionData_status_idx" ON "CheckoutSessionData"("status");
