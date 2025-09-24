import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const hashtagRouter = createTRPCRouter({

  // 1. Get top 10 hashtags each day
  trending: publicProcedure
    .input(z.object({
      days: z.number().min(1).max(30).default(1), // how many past days
    }))
    .query(async ({ ctx, input }) => {
      // Raw SQL is easiest for daily grouping
      const result = await ctx.db.$queryRaw<
        { tag: string; day: string; usage_count: number }[]
      >`
        SELECT 
          "tag",
          DATE("createdAt") AS day,
          COUNT(*) AS usage_count
        FROM "PostHashtag"
        WHERE "createdAt" >= NOW() - INTERVAL '${input.days} days'
        GROUP BY "tag", DATE("createdAt")
        ORDER BY day DESC, usage_count DESC
        LIMIT 9;
      `;
      return result;
    }),

  // 2. Search hashtags (autocomplete) with usage count
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      take: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const hashtags = await ctx.db.hashtag.findMany({
        where: {
          tag: { startsWith: input.query.toLowerCase() },
        },
        orderBy: {
          posts: { _count: "desc" },
        },
        take: input.take,
        include: {
          _count: { select: { posts: true } }, // usage count
        },
      });

      return hashtags.map(h => ({
        tag: h.tag,
        usageCount: h._count.posts,
      }));
    }),

});
