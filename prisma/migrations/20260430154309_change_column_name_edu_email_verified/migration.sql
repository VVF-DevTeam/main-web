/*
  Warnings:

  - You are about to drop the column `eduEmailVerifiedExpireDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "eduEmailVerifiedExpireDate",
ADD COLUMN     "eduEmailExpiredDate" TIMESTAMP(3);
