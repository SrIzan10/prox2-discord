import { commandModule, CommandType } from '@sern/handler';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default commandModule({
  type: CommandType.Button,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const originalMessage = ctx.message.id;

    // many since the message id is not main id
    await db.post.deleteMany({
      where: {
        verifMsgId: originalMessage,
        guildId: ctx.guildId!,
      }
    })

    await ctx.deferUpdate();

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confessionNukeDisabled')
        .setLabel('Confession was NUKED!')
        .setEmoji('💥')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
    );
    await ctx.message.edit({
      components: [buttons],
    });
  },
});