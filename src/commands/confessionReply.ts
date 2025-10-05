import { commandModule, CommandType } from '@sern/handler';
import { bold, MessageFlags } from 'discord.js';

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
    let userReplyId: number | null = null;

    if (!isOp) {
      const replyUserExists = await db.replyUser.findFirst({
        where: {
          userHash: hashedUser,
          guildId: ctx.guildId!,
          postId: dbPost.id,
        },
      });

      if (replyUserExists) {
        userReplyId = replyUserExists.id;
      } else {
        const maxUserId = await db.replyUser.aggregate({
          where: { guildId: ctx.guildId!, postId: dbPost.id },
          _max: { userId: true },
        });
        const nextUserId = (maxUserId._max.userId || 0) + 1;
        const newReplyUser = await db.replyUser.create({
          data: {
            guildId: ctx.guildId!,
            postId: dbPost.id,
            userHash: hashedUser,
            userId: nextUserId,
          },
        });
        userReplyId = newReplyUser.id;
      }
    }

    await ctx.channel.send({
      content: `${bold(isOp ? 'OP' : `Anon #${userReplyId}`)}: ${text}`,
      allowedMentions: { parse: [] },
    });
    return ctx.deferUpdate();
  },
});
