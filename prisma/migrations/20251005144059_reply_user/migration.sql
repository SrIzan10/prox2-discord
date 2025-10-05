-- CreateTable
CREATE TABLE "ReplyUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "userHash" TEXT NOT NULL,
    CONSTRAINT "ReplyUser_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplyUser_userId_key" ON "ReplyUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplyUser_guildId_userHash_key" ON "ReplyUser"("guildId", "userHash");
