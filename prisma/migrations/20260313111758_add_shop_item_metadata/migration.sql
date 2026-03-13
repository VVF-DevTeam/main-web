-- AlterTable
ALTER TABLE "CheckoutSessionData" ADD COLUMN     "shopItemMetadata" JSONB,
ALTER COLUMN "ticketMetadata" DROP NOT NULL;
