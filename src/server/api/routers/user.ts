import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { getLocalFileURL } from "@/lib/utils";

const MAX_PER_PAGE = 50

export const userRouter = createTRPCRouter({

  get: publicProcedure
    .input(z.object({ id: z.string()}))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: input.id
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true
                }
            }
        }
      });
    }),
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      if (currentUserId === input.userId) {
        throw new Error("Du kan ikke følge deg selv");
      }

      // Create follow relationship (or do nothing if it already exists)
      return await ctx.db.follower.upsert({
        where: {
          userId_followerId: {
            userId: input.userId,
            followerId: currentUserId,
          },
        },
        update: {}, // no-op if exists
        create: {
          userId: input.userId,
          followerId: currentUserId,
        },
      });
    }),
  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
  
      return await ctx.db.follower.deleteMany({
        where: {
          userId: input.userId,
          followerId: currentUserId,
        },
      });
    }),
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
  
      const follow = await ctx.db.follower.findUnique({
        where: {
          userId_followerId: {
            userId: input.userId,
            followerId: currentUserId,
          },
        },
      });
  
      return !!follow;
    }),
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
  
      const followers = await ctx.db.follower.findMany({
        where: {
          followerId: input.userId
        },
        include: {
          user: true
        },
      });
  
      return followers;
    }),
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
  
      const followers = await ctx.db.follower.findMany({
        where: {
          userId: input.userId
        },
        include: {
          follower: true
        },
      });
  
      return followers;
    }),
    changeBanner: protectedProcedure
      .input(z.object({ fileId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
  
        // Update the user's banner in the database
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { banner: input.fileId },
        });
  
        return updatedUser;
      }),
    changeAvatar: protectedProcedure
      .input(z.object({ fileId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
  
        const file = await ctx.db.file.findUnique({where: { id: input.fileId }})
        if (!file) "" // Throw file not found error }
        // Update the user's banner in the database
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { image: getLocalFileURL(input.fileId) },
        });
  
        return updatedUser;
      }),
    changeStatus: protectedProcedure
      .input(z.object({ fileId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
  
        const file = await ctx.db.file.findUnique({where: { id: input.fileId }})
        if (!file) "" // Throw file not found error }
        // Update the user's banner in the database
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { image: getLocalFileURL(input.fileId) },
        });
  
        return updatedUser;
      }),
    list: publicProcedure
        .input(
          z.object({
            page: z.number().int().min(1).default(1),
            per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(10)
          })
        )
        .query(async ({ ctx, input }) => {
          const { page, per_page } = input;
    
          // total count (for pagination UI)
          const total = await ctx.db.file.count();
    
          // fetch paginated results
          const files = await ctx.db.user.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
          });
    
          return {
            items: files,
            page,
            per_page,
            total,
            total_pages: Math.ceil(total / per_page),
          };
        }),
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(50) }))
      .query(async ({ ctx, input }) => {
        const q = input.query.toLowerCase();

        const users = await ctx.db.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
          take: 10,
        });  
        
        return users;
      }
    ),
  },
);
