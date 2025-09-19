import { ActionRowBuilder } from '@discordjs/builders';
import { commandModule, CommandType } from '@sern/handler';
import { IntegrationContextType, publishConfig } from '@sern/publisher';
import { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { isSetup } from '../guildUtils';

export default commandModule({
  type: CommandType.Both,
  plugins: [
    publishConfig({
      contexts: [IntegrationContextType.GUILD],
    }),
  ],
  description: 'Send a message! (approval first tho)',
  execute: async (ctx, sdt) => {
    if (!await isSetup(ctx.guildId!, sdt.deps.prisma)) {
      return await ctx.reply({
        content: 'looks like an admin hasn\'t set up the bot yet! womp womp',
        flags: MessageFlags.Ephemeral,
      })
    }
    const modal = new ModalBuilder().setCustomId('confessionModal').setTitle('Send a confession');

    const textInput = new TextInputBuilder()
      .setCustomId('confessionInput')
      .setLabel("What's your confession?")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2000)
      .setPlaceholder('Type your confession here...')
      .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

    modal.addComponents(actionRow);
    await ctx.interaction.showModal(modal);
  },
});
