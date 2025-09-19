import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function buttonGen(up = 0, down = 0) {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confessionUpvote')
        .setEmoji('<:upvote:1418311802193969215>')
        .setLabel(up.toString())
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('confessionDownvote')
        .setEmoji('<:downvote:1418311836326957197>')
        .setLabel(down.toString())
        .setStyle(ButtonStyle.Danger),
    )
}