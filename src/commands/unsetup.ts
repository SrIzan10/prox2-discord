import { commandModule, CommandType } from '@sern/handler';
import { publishConfig } from '@sern/publisher';
import { InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { isSetup } from '../guildUtils';

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
      contexts: [InteractionContextType.Guild],
    }),
  ],
  description: 'remove setup config (essentially disables bot)',
  options: [],
  execute: async (ctx, sdt) => {
    if (!isSetup(ctx.guildId!, sdt.deps.prisma)) {
      return await ctx.reply({
        content: 'not set up lmao',
        flags: MessageFlags.Ephemeral,
      })
    }

    await sdt.deps.prisma.guildConfig.delete({
      where: {
        guildId: ctx.guildId!,
      }
    })

    await ctx.reply({
      content: 'ok nuked config',
      flags: MessageFlags.Ephemeral,
    })
  },
});
