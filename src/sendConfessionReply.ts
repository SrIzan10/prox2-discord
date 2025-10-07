import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { bold, MessageFlags } from 'discord.js';

export async function sendConfessionReply({
  channelId,
  guildId,
  userId,
  text,
  db,
}: Args): Promise<Response> {
  const hashedUser = new Bun.CryptoHasher('sha256')
    .update(`${process.env.SALT}-${userId}`)
    .digest('hex');

  const dbPost = await db.post.findFirst({
    where: {
      publicMsgId: channelId,
      guildId: guildId,
    },
  });

  if (!dbPost) {
    return {
      content: "there's no post?",
      flags: MessageFlags.Ephemeral,
    };
  }

  const isOp = dbPost.posterHash === hashedUser;
  let anonNumber: number | null = null;

  if (!isOp) {
    // try to find existing reply user and use their userId (the anon number)
    const existing = await db.replyUser.findFirst({
      where: {
        userHash: hashedUser,
        guildId: guildId,
        postId: dbPost.id,
      },
      select: { userId: true },
    });

    if (existing) {
      anonNumber = existing.userId;
    } else {
      // compute next anon number
      const maxUserId = await db.replyUser.aggregate({
        where: { guildId: guildId, postId: dbPost.id },
        _max: { userId: true },
      });
      const nextUserId = (maxUserId._max.userId ?? 0) + 1;

      try {
        const newReplyUser = await db.replyUser.create({
          data: {
            guildId: guildId,
            postId: dbPost.id,
            userHash: hashedUser,
            userId: nextUserId,
          },
          select: { userId: true },
        });
        anonNumber = newReplyUser.userId;
      } catch (err) {
        // handle concurrent create -> unique constraint
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
          const retry = await db.replyUser.findFirst({
            where: {
              userHash: hashedUser,
              guildId: guildId,
              postId: dbPost.id,
            },
            select: { userId: true },
          });
          if (retry) {
            anonNumber = retry.userId;
          } else {
            return {
              content: 'Could not register your anonymous reply. Please try again.',
              flags: MessageFlags.Ephemeral,
            };
          }
        } else {
          console.error('replyUser.create error:', err);
          return {
            content: 'An unexpected error occurred.',
            flags: MessageFlags.Ephemeral,
          };
        }
      }
    }
  }
  return {
    content: `${bold(isOp ? 'OP' : `Anon #${anonNumber}`)}: ${text}`,
  };
}

interface Args {
  channelId: string;
  guildId: string;
  userId: string;
  text: string;
  db: PrismaClient;
}

interface Response {
  content: string;
  flags?: number;
}
