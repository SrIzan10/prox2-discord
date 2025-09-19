/*
  Warnings:

  - Added the required column `publicMsgId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "verifMsgId" TEXT NOT NULL,
    "publicMsgId" TEXT NOT NULL
);
INSERT INTO "new_Post" ("content", "id", "published", "verifMsgId") SELECT "content", "id", "published", "verifMsgId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
