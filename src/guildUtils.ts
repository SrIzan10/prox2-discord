import type { PrismaClient } from '@prisma/client';

export async function isSetup(guildId: string, prisma: PrismaClient) {
  const dbGuild = await prisma.guildConfig.count({
    where: {
      guildId,
    },
  }) === 1;

  return dbGuild;
}

export async function getGuildConfig(guildId: string, prisma: PrismaClient) {
  return prisma.guildConfig.findFirst({
    where: {
      guildId,
    }
  })
}