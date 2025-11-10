import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";

export const pollRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(z.object({ optionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { optionId } = input;

      // 1️⃣ Verify that the option exists
      const option = await db.pollOption.findUnique({
        where: { id: optionId },
        include: {
          poll: {
            include: {
              entries: true, // all votes in this poll
            },
          },
        },
      });

      if (!option) {
        throw new Error("Poll option not found.");
      }

      const poll = option.poll;

      if (!poll) {
        throw new Error("Poll not found.");
      }

      // 2️⃣ Check if the user already voted in this poll
      const existingVote = await db.pollEntry.findFirst({
        where: {
          pollId: poll.id,
          userId,
        },
      });

      // 3️⃣ Handle vote logic depending on multipleChoice flag
      if (poll.multipleChoice) {
        // Multiple-choice poll: toggle vote
        const existingEntry = await db.pollEntry.findFirst({
          where: {
            pollId: poll.id,
            userId,
            optionId,
          },
        });

        if (existingEntry) {
          // Unvote (remove entry)
          await db.pollEntry.delete({
            where: { id: existingEntry.id },
          });
          return { status: "removed", optionId };
        }

        // Otherwise, add a new vote
        await db.pollEntry.create({
          data: {
            pollId: poll.id,
            optionId,
            userId,
          },
        });

        return { status: "added", optionId };
      } else {
        // Single-choice poll
        if (existingVote) {
          // If the user already voted for this same option, remove it (toggle)
          if (existingVote.optionId === optionId) {
            await db.pollEntry.delete({
              where: { id: existingVote.id },
            });
            return { status: "removed", optionId };
          }

          // Otherwise, switch vote to a new option
          await db.pollEntry.update({
            where: { id: existingVote.id },
            data: { optionId },
          });

          return { status: "switched", optionId };
        } else {
          // User hasn't voted yet, create new entry
          await db.pollEntry.create({
            data: {
              pollId: poll.id,
              optionId,
              userId,
            },
          });

          return { status: "added", optionId };
        }
      }
    }),
});
