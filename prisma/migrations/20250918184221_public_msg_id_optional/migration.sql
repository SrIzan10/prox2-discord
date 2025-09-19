-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "verifMsgId" TEXT NOT NULL,
    "publicMsgId" TEXT
);
INSERT INTO "new_Post" ("content", "id", "publicMsgId", "published", "verifMsgId") SELECT "content", "id", "publicMsgId", "published", "verifMsgId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
