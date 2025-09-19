import { commandModule, CommandType } from '@sern/handler';
import { buttonGen } from '../buttonGen.js';

export default commandModule({
  type: CommandType.Button,
  plugins: [],
  execute: async (ctx, sdt) => {
    const db = sdt.deps.prisma;
    const messageId = ctx.message.id;
    const voteAuthor = ctx.user.id;
    const hashedAuthor = new Bun.CryptoHasher('sha256')
      .update(`${process.env.SALT}-${voteAuthor}`)
      .digest('hex');

    const dbPost = await db.post.findFirst({
      where: {
        publicMsgId: messageId,
        guildId: ctx.guildId!,
      },
    });
    if (!dbPost) {
      return;
    }
    const voteExists = await db.vote.findFirst({
      where: {
        voterHash: hashedAuthor,
        postId: dbPost.id,
        guildId: ctx.guildId!,
      },
    });

    const [upvoteCount, downvoteCount] = await Promise.all([
      db.vote.count({
        where: {
          postId: dbPost?.id,
          guildId: ctx.guildId!,
          isUpvote: true,
        },
      }),
      db.vote.count({
        where: {
          postId: dbPost?.id,
          guildId: ctx.guildId!,
          isUpvote: false,
        },
      }),
    ]);

    if (voteExists && voteExists.isUpvote) {
      await db.vote.delete({
        where: {
          id: voteExists.id,
          guildId: ctx.guildId!,
        },
      });
      await ctx.message.edit({
        components: [buttonGen(upvoteCount - 1, downvoteCount)],
      });
    } else if (voteExists && !voteExists.isUpvote) {
      await db.vote.update({
        where: {
          id: voteExists.id,
          guildId: ctx.guildId!,
        },
        data: {
          isUpvote: true,
        },
      });
      await ctx.message.edit({
        components: [buttonGen(upvoteCount + 1, downvoteCount - 1)],
      });
    } else {
      await ctx.message.edit({
        components: [buttonGen(upvoteCount + 1, downvoteCount)],
      });
      await db.vote.create({
        data: {
          isUpvote: true,
          voterHash: hashedAuthor,
          postId: dbPost.id,
          guildId: ctx.guildId!,
        },
      });
    }
    await ctx.deferUpdate();
  },
});
