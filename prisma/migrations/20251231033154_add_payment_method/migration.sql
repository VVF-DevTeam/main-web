-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ETF', 'BankTransfer', 'Cash', 'Stripe');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'Stripe';
