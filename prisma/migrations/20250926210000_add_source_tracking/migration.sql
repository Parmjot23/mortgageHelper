-- Custom migration to add source tracking
-- Add new columns
ALTER TABLE "Lead" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Lead" ADD COLUMN "referrer" TEXT;

-- Migrate existing source data to new structure
-- For now, set all existing sources to OTHER sourceType and move the value to referrer
UPDATE "Lead" SET "referrer" = "source" WHERE "source" IS NOT NULL;

-- Remove the old source column
ALTER TABLE "Lead" DROP COLUMN "source";
