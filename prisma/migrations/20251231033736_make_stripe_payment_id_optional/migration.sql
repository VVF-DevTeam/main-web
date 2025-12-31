-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'None';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "stripePaymentId" DROP NOT NULL;
