/*
  Warnings:

  - You are about to drop the column `persona` on the `ChecklistTemplate` table. All the data in the column will be lost.
  - Added the required column `leadType` to the `ChecklistTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChecklistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "leadType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ChecklistTemplate" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "ChecklistTemplate";
DROP TABLE "ChecklistTemplate";
ALTER TABLE "new_ChecklistTemplate" RENAME TO "ChecklistTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
