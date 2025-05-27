-- Drift fix for phoneVerified
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN DEFAULT false;
