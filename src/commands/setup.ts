import { commandModule, CommandType } from '@sern/handler';
import { publishConfig } from '@sern/publisher';
import {
  ApplicationCommandOptionType,
  ChannelType,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { isSetup } from '../guildUtils';

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
      contexts: [InteractionContextType.Guild],
    }),
  ],
  description: 'set ts bot up',
  options: [
    {
      name: 'verify',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      description: 'Channel where messages get verified first',
      required: true,
    },
    {
      name: 'public',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      description: 'Public confessions channel',
      required: true,
    },
    {
      name: 'silent',
      type: ApplicationCommandOptionType.Boolean,
      description: 'send public message? (default true)',
    }
  ],
  execute: async (ctx, sdt) => {
    if (await isSetup(ctx.guildId!, sdt.deps.prisma)) {
      return await ctx.reply({
        content: 'if you want to modify channels, please run `/unsetup` and re-setup again.',
        flags: MessageFlags.Ephemeral,
      });
    }
    const verifChannel = ctx.options.getChannel('verify', true, [ChannelType.GuildText]);
    const pubChannel = ctx.options.getChannel('public', true, [ChannelType.GuildText]);
    const silentSetup = ctx.options.getBoolean('silent') ?? true;

    if (!verifChannel.isSendable() || !pubChannel.isSendable()) {
      return await ctx.reply({
        content:
          "i can't send a message to one of the channels! please make sure you get that done first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!pubChannel.permissionsFor(ctx.guild?.members.me!).has('CreatePublicThreads') || !pubChannel.permissionsFor(ctx.guild?.members.me!).has('ManageThreads')) {
      return await ctx.reply({
        content:
          "i can't create any threads, apparently. please review my bot permissions.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await sdt.deps.prisma.guildConfig.create({
      data: {
        guildId: ctx.guildId!,
        publicChannelId: pubChannel.id,
        verifChannelId: verifChannel.id,
      },
    });

    return await ctx.reply({
      content:
        "this bot is now set up!",
      flags: silentSetup ? MessageFlags.Ephemeral : undefined,
    });
  },
});
