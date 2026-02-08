-- CreateTable
CREATE TABLE "CheckoutSessionData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seatNumbers" JSONB,
    "ticketMetadata" JSONB NOT NULL,
    "otherGuestsInfo" JSONB,
    "stripeSessionId" TEXT,

    CONSTRAINT "CheckoutSessionData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSessionData_stripeSessionId_key" ON "CheckoutSessionData"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CheckoutSessionData_stripeSessionId_idx" ON "CheckoutSessionData"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CheckoutSessionData_createdAt_idx" ON "CheckoutSessionData"("createdAt");
