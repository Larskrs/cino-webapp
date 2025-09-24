import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const fileRouter = createTRPCRouter({

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const files = await ctx.db.file.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        createdById: userId
      }
    });

    return files;
  }),
});
