/*
  Warnings:

  - The values [Media,Operations,Event] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobType_new" AS ENUM ('Performance', 'Marketing', 'ProjectManager', 'HR', 'Tech', 'Finance');
ALTER TABLE "Job" ALTER COLUMN "jobType" TYPE "JobType_new" USING ("jobType"::text::"JobType_new");
ALTER TYPE "JobType" RENAME TO "JobType_old";
ALTER TYPE "JobType_new" RENAME TO "JobType";
DROP TYPE "JobType_old";
COMMIT;
