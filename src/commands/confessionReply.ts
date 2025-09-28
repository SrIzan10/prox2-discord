import { commandModule, CommandType } from '@sern/handler';
import { MessageFlags } from 'discord.js';

export default commandModule({
  type: CommandType.Modal,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const text = ctx.fields.getTextInputValue('confessionReplyText');
    const hashedUser = new Bun.CryptoHasher('sha256')
      .update(`${process.env.SALT}-${ctx.user.id}`)
      .digest('hex');

    const dbPost = await db.post.findFirst({
      where: {
        publicMsgId: ctx.channel?.id,
        guildId: ctx.guildId!,
      },
    });

    if (dbPost?.posterHash !== hashedUser) {
      return ctx.reply({
        content: "you don't seem to be op here...",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!ctx.channel?.isSendable()) {
      return ctx.reply({
        content: "i can't seem to send anything :heavysob:",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.channel.send({
      content: text,
      allowedMentions: { parse: [] }
    });
    return ctx.deferUpdate();
  },
});
