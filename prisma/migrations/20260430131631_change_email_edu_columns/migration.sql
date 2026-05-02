/*
  Warnings:

  - You are about to drop the column `eduEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedExpireDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "eduEmailVerified",
DROP COLUMN "emailVerifiedExpireDate",
ADD COLUMN     "eduEmailVerifiedDate" TIMESTAMP(3),
ADD COLUMN     "eduEmailVerifiedExpireDate" TIMESTAMP(3);
