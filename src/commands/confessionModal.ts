import { commandModule, CommandType } from '@sern/handler';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { getGuildConfig } from '../guildUtils';

export default commandModule({
  type: CommandType.Modal,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const guildConfig = await getGuildConfig(ctx.guildId!, db);
    const confession = ctx.fields.getTextInputValue('confessionInput');
    const confessionAuthor = ctx.user.id;
    const hashedAuthor = new Bun.CryptoHasher('sha256')
      .update(`${process.env.SALT}-${confessionAuthor}`)
      .digest('hex');

    const verifChannel = ctx.client.channels.cache.get(guildConfig?.verifChannelId!);
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confessionApprove')
        .setLabel('Approve')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('confessionNuke')
        .setLabel('Nuke ts')
        .setEmoji('💥')
        .setStyle(ButtonStyle.Danger)
    );

    if (!verifChannel?.isSendable()) {
      return await ctx.reply({
        content: 'Something went to shit :noooooooooooooooooooooo:',
        flags: MessageFlags.Ephemeral,
      });
    }

    const verifMsg = await verifChannel.send({
      content: confession,
      components: [buttons],
      allowedMentions: { parse: [] },
    });

    await db.post.create({
      data: {
        content: confession,
        verifMsgId: verifMsg.id,
        posterHash: hashedAuthor,
        guildId: ctx.guildId!,
      },
    });
    const sentMsg = await ctx.reply({
      content: 'Confession sent! Now you shall wait for a review.',
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(() => sentMsg.delete(), 2000);
  },
});
