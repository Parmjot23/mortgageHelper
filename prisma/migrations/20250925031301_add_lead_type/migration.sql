-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "leadType" TEXT NOT NULL DEFAULT 'PURCHASE',
    "nextActionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Lead" ("createdAt", "email", "firstName", "id", "lastName", "nextActionAt", "phone", "source", "stage", "tags", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "nextActionAt", "phone", "source", "stage", "tags", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_stage_nextActionAt_idx" ON "Lead"("stage", "nextActionAt");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
