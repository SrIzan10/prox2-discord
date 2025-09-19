import { commandModule, CommandType } from '@sern/handler';
import { IntegrationContextType, publishConfig } from '@sern/publisher';
import {
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { isSetup } from '../guildUtils';

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      contexts: [IntegrationContextType.GUILD],
    }),
  ],
  description: 'OP: reply to this thread',
  options: [],
  execute: async (ctx, sdt) => {
    if (!await isSetup(ctx.guildId!, sdt.deps.prisma)) {
      return await ctx.reply({
        content: 'looks like an admin hasn\'t set up the bot yet! womp womp',
        flags: MessageFlags.Ephemeral,
      })
    }
    if (!ctx.channel?.isThread()) {
      return await ctx.reply({
        content: "looks like you're not in a thread!",
        flags: MessageFlags.Ephemeral,
      });
    }
    const modal = new ModalBuilder().setCustomId('confessionReply').setTitle('Send a confession');

    const textInput = new TextInputBuilder()
      .setCustomId('confessionReplyText')
      .setLabel('want to reply?')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2000)
      .setPlaceholder('here!')
      .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

    modal.addComponents(actionRow);
    await ctx.interaction.showModal(modal);
  },
});
