import { commandModule, CommandType } from '@sern/handler';
import { bold, MessageFlags } from 'discord.js';
import { Prisma } from '@prisma/client';

export default commandModule({
  type: CommandType.Modal,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const text = ctx.fields.getTextInputValue('confessionReplyText');

    if (!ctx.channel?.isSendable()) {
      return ctx.reply({
        content: "i can't seem to send anything :heavysob:",
        flags: MessageFlags.Ephemeral,
      });
    }

    const hashedUser = new Bun.CryptoHasher('sha256')
      .update(`${process.env.SALT}-${ctx.user.id}`)
      .digest('hex');

    const dbPost = await db.post.findFirst({
      where: {
        publicMsgId: ctx.channel?.id,
        guildId: ctx.guildId!,
      },
    });

    if (!dbPost) {
      return ctx.reply({
        content: "there's no post?",
        flags: MessageFlags.Ephemeral,
      });
    }

    const isOp = dbPost.posterHash === hashedUser;
    let anonNumber: number | null = null;

    if (!isOp) {
      // try to find existing reply user and use their userId (the anon number)
      const existing = await db.replyUser.findFirst({
        where: {
          userHash: hashedUser,
          guildId: ctx.guildId!,
          postId: dbPost.id,
        },
        select: { userId: true },
      });

      if (existing) {
        anonNumber = existing.userId;
      } else {
        // compute next anon number
        const maxUserId = await db.replyUser.aggregate({
          where: { guildId: ctx.guildId!, postId: dbPost.id },
          _max: { userId: true },
        });
        const nextUserId = (maxUserId._max.userId ?? 0) + 1;

        try {
          const newReplyUser = await db.replyUser.create({
            data: {
              guildId: ctx.guildId!,
              postId: dbPost.id,
              userHash: hashedUser,
              userId: nextUserId,
            },
            select: { userId: true },
          });
          anonNumber = newReplyUser.userId;
        } catch (err) {
          // handle concurrent create -> unique constraint
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const retry = await db.replyUser.findFirst({
              where: {
                userHash: hashedUser,
                guildId: ctx.guildId!,
                postId: dbPost.id,
              },
              select: { userId: true },
            });
            if (retry) {
              anonNumber = retry.userId;
            } else {
              return ctx.reply({
                content: 'Could not register your anonymous reply. Please try again.',
                flags: MessageFlags.Ephemeral,
              });
            }
          } else {
            console.error('replyUser.create error:', err);
            return ctx.reply({
              content: 'An unexpected error occurred.',
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      }
    }

    await ctx.channel.send({
      content: `${bold(isOp ? 'OP' : `Anon #${anonNumber}`)}: ${text}`,
      allowedMentions: { parse: [] },
    });
    return ctx.deferUpdate();
  },
});
