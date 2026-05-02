/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerifiedDate" TIMESTAMP(3),
ADD COLUMN     "emailVerifiedExpireDate" TIMESTAMP(3);
