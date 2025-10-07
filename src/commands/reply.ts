import { commandModule, CommandType } from '@sern/handler';
import { IntegrationContextType, publishConfig } from '@sern/publisher';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { isSetup } from '../guildUtils';
import { sendConfessionReply } from '../sendConfessionReply';

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      contexts: [IntegrationContextType.GUILD],
    }),
  ],
  description: 'OP: reply to this thread',
  options: [
    {
      name: 'text',
      description: 'the text of your confession reply',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  execute: async (ctx, sdt) => {
    const text = ctx.options.getString('text');
    if (!(await isSetup(ctx.guildId!, sdt.deps.prisma))) {
      return await ctx.reply({
        content: "looks like an admin hasn't set up the bot yet! womp womp",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (!ctx.channel?.isThread()) {
      return await ctx.reply({
        content: "looks like you're not in a thread!",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (text) {
      const confessionReply = await sendConfessionReply({
        channelId: ctx.channel.id,
        guildId: ctx.guildId!,
        userId: ctx.user.id,
        text,
        db: sdt.deps.prisma,
      });
      return await ctx.reply({
        content: confessionReply.content,
        flags: confessionReply.flags,
        allowedMentions: { parse: [] },
      });
    } else {
      const modal = new ModalBuilder().setCustomId('confessionReply').setTitle('Send a reply');

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
    }
  },
});
