-- Custom migration to add Referrer model and update Lead referrer field
-- Create the new Referrer table
CREATE TABLE "Referrer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create unique index on referrer name
CREATE UNIQUE INDEX "Referrer_name_key" ON "Referrer"("name");

-- Add referrerId column to Lead table
ALTER TABLE "Lead" ADD COLUMN "referrerId" TEXT;

-- Migrate existing referrer data to Referrer table and link it
INSERT INTO "Referrer" ("id", "name", "isActive", "createdAt", "updatedAt")
SELECT
    LOWER(REPLACE("referrer", ' ', '_')) || '_' || ROWID as "id",
    "referrer" as "name",
    1 as "isActive",
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "Lead"
WHERE "referrer" IS NOT NULL
GROUP BY "referrer";

-- Update Lead table to link referrerId to Referrer table
UPDATE "Lead"
SET "referrerId" = (
    SELECT "id" FROM "Referrer"
    WHERE "Referrer"."name" = "Lead"."referrer"
)
WHERE "referrer" IS NOT NULL;

-- Drop the old referrer column
ALTER TABLE "Lead" DROP COLUMN "referrer";

-- Add foreign key constraint
PRAGMA foreign_keys=ON;
