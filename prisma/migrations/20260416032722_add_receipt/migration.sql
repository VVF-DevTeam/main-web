-- CreateEnum
CREATE TYPE "ExpensePaymentMethod" AS ENUM ('Cash', 'Card', 'BankTransfer', 'EWallet', 'Cheque', 'Other');

-- CreateEnum
CREATE TYPE "ExpenseCategoryType" AS ENUM ('Food', 'Transportation', 'Shopping', 'Utilities', 'Housing', 'Health', 'Education', 'Entertainment', 'Travel', 'Insurance', 'Salary', 'Tax', 'Office', 'Subscription', 'Gift', 'Other');

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receiptNumber" TEXT,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchantName" TEXT NOT NULL,
    "merchantAddress" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tipAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "paymentMethod" "ExpensePaymentMethod" NOT NULL DEFAULT 'Other',
    "paymentReference" TEXT,
    "hasReimbursed" BOOLEAN NOT NULL DEFAULT false,
    "receiptImageUrl" TEXT,
    "rawText" TEXT,
    "userId" TEXT NOT NULL,
    "category" "ExpenseCategoryType" NOT NULL DEFAULT 'Other',

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) DEFAULT 0,
    "discount" DECIMAL(65,30) DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "receiptId" TEXT NOT NULL,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Receipt_userId_receiptDate_idx" ON "Receipt"("userId", "receiptDate");

-- CreateIndex
CREATE INDEX "ReceiptItem_receiptId_idx" ON "ReceiptItem"("receiptId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
