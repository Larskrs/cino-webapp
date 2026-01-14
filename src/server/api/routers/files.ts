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
      cursor: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(10),
      type: z.enum(["image", "video"]).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const page = input.cursor ?? 1;
    const { per_page, type } = input;
  
    const where: any = { createdById: userId };
    if (type) where.type = type;
  
    const total = await ctx.db.file.count({ where });
  
    const items = await ctx.db.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * per_page,
      take: per_page,
      include: { createdBy: true },
    });
  
    const total_pages = Math.ceil(total / per_page);
    const nextCursor = page < total_pages ? page + 1 : undefined;
  
    return {
      items,
      total,
      nextCursor, // 👈 THIS is what unlocks useInfiniteQuery
    };
  })
});
