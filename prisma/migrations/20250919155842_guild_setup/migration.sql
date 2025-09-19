/*
  Warnings:

  - Added the required column `guildId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "verifChannelId" TEXT NOT NULL,
    "publicChannelId" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT NOT NULL,
    "verifMsgId" TEXT NOT NULL,
    "posterHash" TEXT NOT NULL,
    "publicMsgId" TEXT
);
INSERT INTO "new_Post" ("content", "id", "posterHash", "publicMsgId", "published", "verifMsgId") SELECT "content", "id", "posterHash", "publicMsgId", "published", "verifMsgId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "voterHash" TEXT NOT NULL,
    "isUpvote" BOOLEAN NOT NULL,
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("createdAt", "id", "isUpvote", "postId", "voterHash") SELECT "createdAt", "id", "isUpvote", "postId", "voterHash" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE UNIQUE INDEX "Vote_postId_voterHash_key" ON "Vote"("postId", "voterHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
