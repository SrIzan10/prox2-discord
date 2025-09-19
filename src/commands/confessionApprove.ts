import { commandModule, CommandType } from '@sern/handler';
import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { buttonGen } from '../buttonGen.js';
import { getGuildConfig } from '../guildUtils.js';

export default commandModule({
  type: CommandType.Button,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const guildConf = await getGuildConfig(ctx.guildId!, db);
    const originalMessageId = ctx.message.id;

    const dbMessage = await db.post.findFirst({
      where: {
        verifMsgId: originalMessageId,
        guildId: ctx.guildId!,
      },
    });
    if (!dbMessage) {
      return await ctx.reply({
        content: 'what the fuck',
        flags: MessageFlags.Ephemeral,
      });
    }

    // send message
    const publicChannel = await ctx.client.channels.fetch(guildConf?.publicChannelId!);
    if (!publicChannel?.isSendable()) {
      return await ctx.reply({
        content: 'what the fuck 2',
        flags: MessageFlags.Ephemeral,
      });
    }
    const publicMsg = await publicChannel.send({
      content: `${bold(dbMessage.id.toString())}: ${dbMessage.content}`,
      components: [buttonGen()],
      allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    });
    publicMsg.startThread({
      name: `number ${dbMessage.id} discussion`
    })

    // verifmsgid is not the primary id so we do many here :)
    await db.post.updateMany({
      where: {
        verifMsgId: originalMessageId,
        guildId: ctx.guildId!,
      },
      data: {
        publicMsgId: publicMsg.id,
        published: true,
      },
    });

    await ctx.deferUpdate()

    // some ux feedback in here
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confessionApproveDisabled')
        .setLabel('Confession was approved')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );
    await ctx.message.edit({
      components: [buttons],
    });
  },
});
