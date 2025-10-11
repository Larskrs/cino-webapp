import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const MAX_PER_PAGE = 50

export const fileRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { page, per_page } = input;

      // total count (for pagination UI)
      const total = await ctx.db.file.count({
        where: { createdById: userId },
      });

      // fetch paginated results
      const files = await ctx.db.file.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * per_page,
        take: per_page,
        include: { createdBy: true }
      });

      return {
        items: files,
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      };
    }),
});
