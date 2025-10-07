import { commandModule, CommandType } from '@sern/handler';
import { bold, MessageFlags } from 'discord.js';
import { sendConfessionReply } from '../sendConfessionReply';

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

    const replyFunc = await sendConfessionReply({
      channelId: ctx.channel.id,
      guildId: ctx.guildId!,
      userId: ctx.user.id,
      text,
      db,
    });

    await ctx.channel.send({
      content: replyFunc.content,
      allowedMentions: { parse: [] },
      flags: replyFunc.flags,
    });
    return ctx.deferUpdate();
  },
});
