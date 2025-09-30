-- Migration to update ApplicationStatus enum
-- Update existing NOT_STARTED values to NOT_CONTACTED
UPDATE "Lead" SET "applicationStatus" = 'NOT_CONTACTED' WHERE "applicationStatus" = 'NOT_STARTED';

-- Note: SQLite doesn't support enum constraints like PostgreSQL,
-- so we just need to ensure the data is migrated properly.
-- The enum values will be validated at the application level.
