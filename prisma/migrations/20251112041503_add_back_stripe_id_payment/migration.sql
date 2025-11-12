-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeProductId" TEXT,
ALTER COLUMN "stripePaymentId" DROP NOT NULL;
